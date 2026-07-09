package com.pyt.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

@Component
public class XlsxWorkbookReader {

    public List<XlsxSheet> readSheets(MultipartFile file)
            throws IOException, ParserConfigurationException, SAXException {
        Map<String, byte[]> entries = readZipEntries(file);
        List<String> sharedStrings = readSharedStrings(entries.get("xl/sharedStrings.xml"));
        Map<String, String> relationships = readWorkbookRelationships(entries.get("xl/_rels/workbook.xml.rels"));
        byte[] workbookBytes = entries.get("xl/workbook.xml");

        if (workbookBytes == null) {
            throw new IllegalArgumentException("엑셀 통합 문서 정보를 찾을 수 없습니다.");
        }

        Document workbookDocument = parseXml(workbookBytes);
        NodeList sheetNodes = workbookDocument.getElementsByTagNameNS("*", "sheet");
        List<XlsxSheet> sheets = new ArrayList<>();
        for (int index = 0; index < sheetNodes.getLength(); index++) {
            Element sheetElement = (Element) sheetNodes.item(index);
            String sheetName = sheetElement.getAttribute("name");
            String relationshipId = sheetElement.getAttributeNS(
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
                    "id");
            if (relationshipId == null || relationshipId.isBlank()) {
                relationshipId = sheetElement.getAttribute("r:id");
            }

            String sheetPath = relationships.get(relationshipId);
            byte[] sheetBytes = sheetPath == null ? null : entries.get(sheetPath);
            if (sheetBytes != null) {
                sheets.add(new XlsxSheet(sheetName, readSheetRows(sheetBytes, sharedStrings)));
            }
        }

        return sheets;
    }

    private Map<String, byte[]> readZipEntries(MultipartFile file) throws IOException {
        Map<String, byte[]> entries = new HashMap<>();
        try (ZipInputStream zipInputStream = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    entries.put(entry.getName(), zipInputStream.readAllBytes());
                }
            }
        }

        return entries;
    }

    private List<String> readSharedStrings(byte[] sharedStringBytes)
            throws ParserConfigurationException, IOException, SAXException {
        if (sharedStringBytes == null) {
            return Collections.emptyList();
        }

        Document document = parseXml(sharedStringBytes);
        NodeList stringNodes = document.getElementsByTagNameNS("*", "si");
        List<String> sharedStrings = new ArrayList<>();
        for (int index = 0; index < stringNodes.getLength(); index++) {
            Element stringElement = (Element) stringNodes.item(index);
            sharedStrings.add(readTextNodes(stringElement));
        }

        return sharedStrings;
    }

    private Map<String, String> readWorkbookRelationships(byte[] relationshipBytes)
            throws ParserConfigurationException, IOException, SAXException {
        if (relationshipBytes == null) {
            return Collections.emptyMap();
        }

        Document document = parseXml(relationshipBytes);
        NodeList relationshipNodes = document.getElementsByTagNameNS("*", "Relationship");
        Map<String, String> relationships = new HashMap<>();
        for (int index = 0; index < relationshipNodes.getLength(); index++) {
            Element relationshipElement = (Element) relationshipNodes.item(index);
            String id = relationshipElement.getAttribute("Id");
            String target = relationshipElement.getAttribute("Target");
            if (!id.isBlank() && !target.isBlank()) {
                relationships.put(id, resolveXlsxPath("xl", target));
            }
        }

        return relationships;
    }

    private List<List<String>> readSheetRows(byte[] sheetBytes, List<String> sharedStrings)
            throws ParserConfigurationException, IOException, SAXException {
        Document document = parseXml(sheetBytes);
        NodeList cellNodes = document.getElementsByTagNameNS("*", "c");
        List<List<String>> rows = new ArrayList<>();

        for (int index = 0; index < cellNodes.getLength(); index++) {
            Element cellElement = (Element) cellNodes.item(index);
            CellAddress cellAddress = parseCellAddress(cellElement.getAttribute("r"));
            if (cellAddress == null) {
                continue;
            }

            while (rows.size() <= cellAddress.rowIndex()) {
                rows.add(new ArrayList<>());
            }

            List<String> row = rows.get(cellAddress.rowIndex());
            while (row.size() <= cellAddress.columnIndex()) {
                row.add(null);
            }

            row.set(cellAddress.columnIndex(), readCellValue(cellElement, sharedStrings));
        }

        return rows;
    }

    private Document parseXml(byte[] bytes) throws ParserConfigurationException, IOException, SAXException {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");

        return factory.newDocumentBuilder().parse(new ByteArrayInputStream(bytes));
    }

    private String resolveXlsxPath(String baseDirectory, String target) {
        if (target.startsWith("/")) {
            return target.substring(1);
        }

        return Path.of(baseDirectory).resolve(target).normalize().toString().replace('\\', '/');
    }

    private String readCellValue(Element cellElement, List<String> sharedStrings) {
        String cellType = cellElement.getAttribute("t");
        if ("inlineStr".equals(cellType)) {
            return normalize(readTextNodes(cellElement), null);
        }

        String rawValue = readFirstChildText(cellElement, "v");
        if (rawValue == null) {
            return null;
        }

        if ("s".equals(cellType)) {
            try {
                int sharedStringIndex = Integer.parseInt(rawValue);
                if (sharedStringIndex >= 0 && sharedStringIndex < sharedStrings.size()) {
                    return normalize(sharedStrings.get(sharedStringIndex), null);
                }
            } catch (NumberFormatException e) {
                return null;
            }
        }

        if ("b".equals(cellType)) {
            return "1".equals(rawValue) ? "true" : "false";
        }

        return normalize(rawValue, null);
    }

    private String readTextNodes(Element element) {
        NodeList textNodes = element.getElementsByTagNameNS("*", "t");
        StringBuilder value = new StringBuilder();
        for (int index = 0; index < textNodes.getLength(); index++) {
            value.append(textNodes.item(index).getTextContent());
        }

        return value.toString();
    }

    private String readFirstChildText(Element element, String localName) {
        NodeList nodes = element.getElementsByTagNameNS("*", localName);
        if (nodes.getLength() == 0) {
            return null;
        }

        return nodes.item(0).getTextContent();
    }

    private CellAddress parseCellAddress(String reference) {
        if (reference == null || reference.isBlank()) {
            return null;
        }

        int columnIndex = 0;
        int position = 0;
        while (position < reference.length() && Character.isLetter(reference.charAt(position))) {
            columnIndex = columnIndex * 26 + Character.toUpperCase(reference.charAt(position)) - 'A' + 1;
            position++;
        }

        if (columnIndex == 0 || position >= reference.length()) {
            return null;
        }

        try {
            int rowIndex = Integer.parseInt(reference.substring(position)) - 1;
            return rowIndex < 0 ? null : new CellAddress(rowIndex, columnIndex - 1);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String normalize(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }

        return value.trim();
    }

    public record XlsxSheet(String name, List<List<String>> rows) {
    }

    private record CellAddress(int rowIndex, int columnIndex) {
    }
}
