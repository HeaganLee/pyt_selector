package com.pyt.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import com.pyt.dto.CardProductRespDto;
import com.pyt.dto.ProductDetailRespDto;
import com.pyt.dto.product.req.CardProductChecklistCreateReqDto;
import com.pyt.dto.product.req.CardProductChecklistCreateReqDto.CardProductChecklistItemCreateReqDto;
import com.pyt.dto.product.req.CardProductCreateReqDto;
import com.pyt.dto.product.req.CardProductCreateReqDto.CardProductOptionCreateReqDto;
import com.pyt.dto.product.req.CardProductTierCriteriaCreateReqDto;
import com.pyt.dto.product.req.CardProductTierCriteriaCreateReqDto.CardProductTeamTierCreateReqDto;
import com.pyt.dto.product.resp.CardProductAdminRespDto;
import com.pyt.dto.product.resp.CardProductChecklistCreateRespDto;
import com.pyt.dto.product.resp.CardProductCreateRespDto;
import com.pyt.dto.product.resp.CardProductTierCriteriaCreateRespDto;
import com.pyt.dto.product.resp.CardCompanyRespDto;
import com.pyt.dto.product.resp.ProductChecklistRespDto;
import com.pyt.dto.product.resp.ProductTierBoardRespDto;
import com.pyt.dto.product.resp.SportsTeamAdminRespDto;
import com.pyt.entities.CardCompany;
import com.pyt.entities.CardProduct;
import com.pyt.entities.CardProductChecklistItem;
import com.pyt.entities.CardProductOption;
import com.pyt.entities.CardProductTeamTier;
import com.pyt.entities.CardProductTierCriteria;
import com.pyt.entities.SportsTeam;
import com.pyt.enums.ActiveStatus;
import com.pyt.enums.BoxType;
import com.pyt.enums.SportType;
import com.pyt.repository.CardCompanyRepository;
import com.pyt.repository.CardProductChecklistItemRepository;
import com.pyt.repository.CardProductOptionRepository;
import com.pyt.repository.CardProductRepository;
import com.pyt.repository.CardProductTeamTierRepository;
import com.pyt.repository.CardProductTierCriteriaRepository;
import com.pyt.repository.SportsTeamRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final CardProductRepository cardProductRepository;
    private final CardProductOptionRepository cardProductOptionRepository;
    private final CardCompanyRepository cardCompanyRepository;
    private final CardProductTierCriteriaRepository cardProductTierCriteriaRepository;
    private final CardProductTeamTierRepository cardProductTeamTierRepository;
    private final CardProductChecklistItemRepository cardProductChecklistItemRepository;
    private final SportsTeamRepository sportsTeamRepository;
    private final AdminAuthorizationService adminAuthorizationService;

    @Transactional(readOnly = true)
    public List<CardProductRespDto> getProductItems() {
        LocalDate today = LocalDate.now();

        LocalDate onSaleStartDate = today.minusDays(14);
        LocalDate upcomingEndDate = today.plusMonths(1);

        return cardProductRepository
                .findByReleaseDateBetweenOrderByReleaseDateAsc(
                        onSaleStartDate,
                        upcomingEndDate)
                .stream()
                .map(CardProductRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CardProductRespDto> getCatalogItems(SportType sportType) {
        List<CardProduct> products = sportType == null
                ? cardProductRepository.findAllByOrderByReleaseDateDescIdDesc()
                : cardProductRepository.findBySportTypeOrderByReleaseDateDescIdDesc(sportType);

        return products.stream()
                .map(CardProductRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CardProductRespDto> getReleaseCalendarItems() {
        return cardProductRepository.findAllByOrderByReleaseDateDescIdDesc()
                .stream()
                .map(CardProductRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductTierBoardRespDto> getTierBoardItems() {
        return cardProductRepository.findAllByOrderByReleaseDateDescIdDesc()
                .stream()
                .filter(cardProduct -> !cardProduct.getTierCriteria().isEmpty())
                .map(ProductTierBoardRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductChecklistRespDto> getChecklistItems() {
        Map<Long, List<CardProductChecklistItem>> itemsByProductId = new LinkedHashMap<>();

        for (CardProductChecklistItem item : cardProductChecklistItemRepository.findAllForPublicChecklist()) {
            itemsByProductId.computeIfAbsent(item.getCardProduct().getId(), key -> new ArrayList<>())
                    .add(item);
        }

        return itemsByProductId.values()
                .stream()
                .map(items -> new ProductChecklistRespDto(items.get(0).getCardProduct(), items))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDetailRespDto getProductDetail(Long productId) {
        CardProduct product = cardProductRepository.findDetailById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        return new ProductDetailRespDto(product);
    }

    @Transactional(readOnly = true)
    public List<CardCompanyRespDto> getAdminCardCompanies(String authorizationHeader) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);

        return cardCompanyRepository.findAllByOrderByNameAsc()
                .stream()
                .map(CardCompanyRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CardProductAdminRespDto> getAdminCardProducts(String authorizationHeader) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);

        return cardProductRepository.findAllByOrderByReleaseDateDescIdDesc()
                .stream()
                .map(CardProductAdminRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SportsTeamAdminRespDto> getAdminSportsTeams(String authorizationHeader) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);

        return sportsTeamRepository.findByActiveStatusOrderBySportTypeAscLeagueLevelTypeAscNameAsc(ActiveStatus.ACTIVE)
                .stream()
                .map(SportsTeamAdminRespDto::new)
                .toList();
    }

    @Transactional
    public CardProductCreateRespDto createAdminProduct(
            String authorizationHeader,
            CardProductCreateReqDto reqDto) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);
        validateCreateRequest(reqDto);

        CardCompany cardCompany = cardCompanyRepository.findById(reqDto.getCardCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("카드 회사를 찾을 수 없습니다."));

        CardProduct cardProduct = cardProductRepository.save(new CardProduct(
                cardCompany,
                reqDto.getSportType(),
                normalizeRequired(reqDto.getBrandName(), "브랜드명이 필요합니다."),
                normalizeRequired(reqDto.getProductName(), "상품명이 필요합니다."),
                reqDto.getReleaseDate(),
                normalize(reqDto.getChecklistUrl(), null),
                normalize(reqDto.getImageUrl(), null)));

        List<CardProductOption> options = new ArrayList<>();
        for (CardProductOptionCreateReqDto optionReqDto : reqDto.getOptions()) {
            options.add(new CardProductOption(
                    cardProduct,
                    optionReqDto.getBoxType(),
                    normalize(optionReqDto.getOptionName(), null),
                    optionReqDto.getCardsPerPack(),
                    optionReqDto.getPacksPerBox(),
                    optionReqDto.getBoxesPerCase(),
                    optionReqDto.getEstimatedPrice(),
                    normalize(optionReqDto.getCurrency(), "USD"),
                    normalize(optionReqDto.getConfigurationText(), null)));
        }

        List<CardProductOption> savedOptions = cardProductOptionRepository.saveAll(options);

        return new CardProductCreateRespDto(cardProduct, savedOptions);
    }

    @Transactional
    public CardProductTierCriteriaCreateRespDto createAdminTierCriteria(
            String authorizationHeader,
            CardProductTierCriteriaCreateReqDto reqDto) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);
        validateTierCriteriaRequest(reqDto);

        CardProduct cardProduct = cardProductRepository.findById(reqDto.getCardProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (cardProductTierCriteriaRepository.existsByCardProductIdAndCriteriaType(
                cardProduct.getId(),
                reqDto.getCriteriaType())) {
            throw new IllegalArgumentException("해당 상품에 같은 티어 기준이 이미 등록되어 있습니다.");
        }

        CardProductTierCriteria tierCriteria = cardProductTierCriteriaRepository.save(new CardProductTierCriteria(
                cardProduct,
                reqDto.getCriteriaType(),
                normalizeRequired(reqDto.getCriteriaName(), "티어 기준명이 필요합니다."),
                normalize(reqDto.getDescription(), null)));

        List<CardProductTeamTier> teamTiers = new ArrayList<>();
        for (CardProductTeamTierCreateReqDto teamTierReqDto : reqDto.getTeamTiers()) {
            SportsTeam team = sportsTeamRepository.findById(teamTierReqDto.getTeamId())
                    .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

            if (!team.getSportType().equals(cardProduct.getSportType())) {
                throw new IllegalArgumentException("상품 종목과 팀 종목이 일치해야 합니다.");
            }

            teamTiers.add(new CardProductTeamTier(
                    tierCriteria,
                    team,
                    teamTierReqDto.getExpectedPytPrice(),
                    teamTierReqDto.getTierGrade(),
                    normalize(teamTierReqDto.getKeyPlayers(), null),
                    normalize(teamTierReqDto.getCommentText(), null),
                    normalize(teamTierReqDto.getAiSummary(), null)));
        }

        List<CardProductTeamTier> savedTeamTiers = cardProductTeamTierRepository.saveAll(teamTiers);

        return new CardProductTierCriteriaCreateRespDto(tierCriteria, savedTeamTiers);
    }

    @Transactional
    public CardProductChecklistCreateRespDto createAdminChecklist(
            String authorizationHeader,
            CardProductChecklistCreateReqDto reqDto) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);
        validateChecklistRequest(reqDto);

        CardProduct cardProduct = cardProductRepository.findById(reqDto.getCardProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        String sourceUrl = normalize(reqDto.getSourceUrl(), null);
        if (sourceUrl != null) {
            cardProduct.setChecklistUrl(sourceUrl);
        }

        List<CardProductChecklistItem> checklistItems = new ArrayList<>();
        for (CardProductChecklistItemCreateReqDto itemReqDto : reqDto.getItems()) {
            SportsTeam team = null;
            if (itemReqDto.getTeamId() != null) {
                team = sportsTeamRepository.findById(itemReqDto.getTeamId())
                        .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

                if (!team.getSportType().equals(cardProduct.getSportType())) {
                    throw new IllegalArgumentException("상품 종목과 팀 종목이 일치해야 합니다.");
                }
            }

            checklistItems.add(new CardProductChecklistItem(
                    cardProduct,
                    normalizeRequired(itemReqDto.getSectionName(), "체크리스트 섹션명이 필요합니다."),
                    itemReqDto.getSourcePage(),
                    normalize(itemReqDto.getTopCategory(), null),
                    normalize(itemReqDto.getCardType(), null),
                    normalizeRequired(itemReqDto.getCardNumber(), "카드 번호가 필요합니다."),
                    normalizeRequired(itemReqDto.getPlayerName(), "선수명이 필요합니다."),
                    team,
                    normalize(itemReqDto.getTeamName(), team == null ? null : team.getName()),
                    normalize(itemReqDto.getTeamOriginal(), null),
                    normalize(itemReqDto.getMatchedTeamName(), null),
                    normalize(itemReqDto.getMatchNote(), null),
                    normalize(itemReqDto.getParallelName(), null),
                    itemReqDto.getRookieCard() != null && itemReqDto.getRookieCard(),
                    itemReqDto.getAutograph() != null && itemReqDto.getAutograph(),
                    itemReqDto.getRelic() != null && itemReqDto.getRelic(),
                    itemReqDto.getVariation() != null && itemReqDto.getVariation(),
                    normalize(itemReqDto.getNotes(), null)));
        }

        List<CardProductChecklistItem> savedItems = cardProductChecklistItemRepository.saveAll(checklistItems);

        return new CardProductChecklistCreateRespDto(cardProduct.getId(), sourceUrl, savedItems);
    }

    @Transactional
    public CardProductChecklistCreateRespDto createAdminChecklistFromExcel(
            String authorizationHeader,
            Long cardProductId,
            String sourceUrl,
            MultipartFile file) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);
        validateChecklistUploadRequest(cardProductId, file);

        CardProduct cardProduct = cardProductRepository.findById(cardProductId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        String normalizedSourceUrl = normalize(sourceUrl, null);
        if (normalizedSourceUrl != null) {
            cardProduct.setChecklistUrl(normalizedSourceUrl);
        }

        try {
            XlsxSheet checklistSheet = findChecklistSheet(readXlsxSheets(file));
            List<CardProductChecklistItem> checklistItems = parseChecklistItems(cardProduct, checklistSheet);

            if (checklistItems.isEmpty()) {
                throw new IllegalArgumentException("엑셀에서 저장할 체크리스트 항목을 찾을 수 없습니다.");
            }

            List<CardProductChecklistItem> savedItems = cardProductChecklistItemRepository.saveAll(checklistItems);

            return new CardProductChecklistCreateRespDto(
                    cardProduct.getId(),
                    cardProduct.getChecklistUrl(),
                    savedItems);
        } catch (IOException | ParserConfigurationException | SAXException e) {
            throw new IllegalArgumentException("엑셀 파일을 읽을 수 없습니다.");
        }
    }

    private void validateCreateRequest(CardProductCreateReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("상품 등록 요청이 필요합니다.");
        }
        if (reqDto.getCardCompanyId() == null) {
            throw new IllegalArgumentException("카드 회사를 선택해주세요.");
        }
        if (reqDto.getSportType() == null) {
            throw new IllegalArgumentException("스포츠 종목이 필요합니다.");
        }
        if (reqDto.getBrandName() == null || reqDto.getBrandName().isBlank()) {
            throw new IllegalArgumentException("브랜드명이 필요합니다.");
        }
        if (reqDto.getProductName() == null || reqDto.getProductName().isBlank()) {
            throw new IllegalArgumentException("상품명이 필요합니다.");
        }
        if (reqDto.getReleaseDate() == null) {
            throw new IllegalArgumentException("발매일이 필요합니다.");
        }
        if (reqDto.getOptions() == null || reqDto.getOptions().isEmpty()) {
            throw new IllegalArgumentException("상품 옵션을 하나 이상 입력해주세요.");
        }

        Set<BoxType> boxTypes = new HashSet<>();
        for (CardProductOptionCreateReqDto optionReqDto : reqDto.getOptions()) {
            validateOptionRequest(optionReqDto, boxTypes);
        }
    }

    private void validateOptionRequest(
            CardProductOptionCreateReqDto optionReqDto,
            Set<BoxType> boxTypes) {
        if (optionReqDto == null) {
            throw new IllegalArgumentException("상품 옵션 정보가 필요합니다.");
        }
        if (optionReqDto.getBoxType() == null) {
            throw new IllegalArgumentException("박스 타입이 필요합니다.");
        }
        if (!boxTypes.add(optionReqDto.getBoxType())) {
            throw new IllegalArgumentException("같은 박스 타입은 한 상품에 중복 등록할 수 없습니다.");
        }

        validatePositive(optionReqDto.getCardsPerPack(), "팩당 카드 수");
        validatePositive(optionReqDto.getPacksPerBox(), "박스당 팩 수");
        validatePositive(optionReqDto.getBoxesPerCase(), "케이스당 박스 수");
        validatePositive(optionReqDto.getEstimatedPrice(), "예상 가격");
    }

    private void validateTierCriteriaRequest(CardProductTierCriteriaCreateReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("티어표 등록 요청이 필요합니다.");
        }
        if (reqDto.getCardProductId() == null) {
            throw new IllegalArgumentException("상품을 선택해주세요.");
        }
        if (reqDto.getCriteriaType() == null) {
            throw new IllegalArgumentException("티어 기준 타입이 필요합니다.");
        }
        if (reqDto.getCriteriaName() == null || reqDto.getCriteriaName().isBlank()) {
            throw new IllegalArgumentException("티어 기준명이 필요합니다.");
        }
        if (reqDto.getTeamTiers() == null || reqDto.getTeamTiers().isEmpty()) {
            throw new IllegalArgumentException("팀 티어를 하나 이상 입력해주세요.");
        }

        Set<Long> teamIds = new HashSet<>();
        for (CardProductTeamTierCreateReqDto teamTierReqDto : reqDto.getTeamTiers()) {
            validateTeamTierRequest(teamTierReqDto, teamIds);
        }
    }

    private void validateTeamTierRequest(
            CardProductTeamTierCreateReqDto teamTierReqDto,
            Set<Long> teamIds) {
        if (teamTierReqDto == null) {
            throw new IllegalArgumentException("팀 티어 정보가 필요합니다.");
        }
        if (teamTierReqDto.getTeamId() == null) {
            throw new IllegalArgumentException("팀을 선택해주세요.");
        }
        if (!teamIds.add(teamTierReqDto.getTeamId())) {
            throw new IllegalArgumentException("같은 팀은 한 티어표에 중복 등록할 수 없습니다.");
        }
        if (teamTierReqDto.getTierGrade() == null) {
            throw new IllegalArgumentException("티어 등급이 필요합니다.");
        }

        validatePositive(teamTierReqDto.getExpectedPytPrice(), "예상 PYT 가격");
    }

    private void validateChecklistRequest(CardProductChecklistCreateReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("체크리스트 등록 요청이 필요합니다.");
        }
        if (reqDto.getCardProductId() == null) {
            throw new IllegalArgumentException("상품을 선택해주세요.");
        }
        if (reqDto.getItems() == null || reqDto.getItems().isEmpty()) {
            throw new IllegalArgumentException("체크리스트 항목을 하나 이상 입력해주세요.");
        }

        for (CardProductChecklistItemCreateReqDto itemReqDto : reqDto.getItems()) {
            validateChecklistItemRequest(itemReqDto);
        }
    }

    private void validateChecklistItemRequest(CardProductChecklistItemCreateReqDto itemReqDto) {
        if (itemReqDto == null) {
            throw new IllegalArgumentException("체크리스트 항목 정보가 필요합니다.");
        }
        if (itemReqDto.getSectionName() == null || itemReqDto.getSectionName().isBlank()) {
            throw new IllegalArgumentException("체크리스트 섹션명이 필요합니다.");
        }
        if (itemReqDto.getCardNumber() == null || itemReqDto.getCardNumber().isBlank()) {
            throw new IllegalArgumentException("카드 번호가 필요합니다.");
        }
        if (itemReqDto.getPlayerName() == null || itemReqDto.getPlayerName().isBlank()) {
            throw new IllegalArgumentException("선수명이 필요합니다.");
        }
    }

    private void validateChecklistUploadRequest(Long cardProductId, MultipartFile file) {
        if (cardProductId == null) {
            throw new IllegalArgumentException("상품을 선택해주세요.");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 엑셀 파일을 선택해주세요.");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".xlsx")) {
            throw new IllegalArgumentException("엑셀 파일은 .xlsx 형식만 업로드할 수 있습니다.");
        }
    }

    private List<XlsxSheet> readXlsxSheets(MultipartFile file)
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

    private XlsxSheet findChecklistSheet(List<XlsxSheet> sheets) {
        for (XlsxSheet sheet : sheets) {
            if ("All Cards".equals(sheet.name()) && hasChecklistHeaders(sheet)) {
                return sheet;
            }
        }

        for (XlsxSheet sheet : sheets) {
            if (hasChecklistHeaders(sheet)) {
                return sheet;
            }
        }

        throw new IllegalArgumentException("체크리스트 엑셀 헤더가 있는 시트를 찾을 수 없습니다.");
    }

    private boolean hasChecklistHeaders(XlsxSheet sheet) {
        if (sheet == null) {
            return false;
        }

        Map<String, Integer> headerIndexes = getHeaderIndexes(getRow(sheet, 0));

        return headerIndexes.containsKey("major_section")
                && headerIndexes.containsKey("card_no")
                && headerIndexes.containsKey("player_or_subject");
    }

    private List<CardProductChecklistItem> parseChecklistItems(CardProduct cardProduct, XlsxSheet sheet) {
        Map<String, Integer> headerIndexes = getHeaderIndexes(getRow(sheet, 0));

        int sourcePageIndex = headerIndexes.getOrDefault("source_page", -1);
        int sectionIndex = requireHeader(headerIndexes, "major_section");
        int topCategoryIndex = headerIndexes.getOrDefault("top_category", -1);
        int cardTypeIndex = headerIndexes.getOrDefault("card_type", -1);
        int cardNumberIndex = requireHeader(headerIndexes, "card_no");
        int playerIndex = requireHeader(headerIndexes, "player_or_subject");
        int teamOriginalIndex = headerIndexes.getOrDefault("team_original", -1);
        int teamIdIndex = headerIndexes.getOrDefault("team_id", -1);
        int matchedTeamNameIndex = headerIndexes.getOrDefault("matched_team_name", -1);
        int matchNoteIndex = headerIndexes.getOrDefault("match_note", -1);
        int rookieIndex = headerIndexes.getOrDefault("is_rookie", -1);
        int autographIndex = headerIndexes.getOrDefault("is_autograph", -1);
        int memorabiliaIndex = headerIndexes.getOrDefault("is_memorabilia", -1);
        int variationIndex = headerIndexes.getOrDefault("is_variation", -1);

        Map<Long, SportsTeam> teamsById = new HashMap<>();
        for (SportsTeam team : sportsTeamRepository.findAll()) {
            teamsById.put(team.getId(), team);
        }

        List<CardProductChecklistItem> checklistItems = new ArrayList<>();
        for (int rowIndex = 1; rowIndex < sheet.rows().size(); rowIndex++) {
            List<String> row = getRow(sheet, rowIndex);
            if (row == null) {
                continue;
            }

            String sectionName = readString(row, sectionIndex);
            String cardNumber = readString(row, cardNumberIndex);
            String playerName = readString(row, playerIndex);
            if (sectionName == null && cardNumber == null && playerName == null) {
                continue;
            }

            int excelRowNumber = rowIndex + 1;
            validateRequiredCell(sectionName, excelRowNumber, "major_section");
            validateRequiredCell(cardNumber, excelRowNumber, "card_no");
            validateRequiredCell(playerName, excelRowNumber, "player_or_subject");

            Long teamId = readLong(row, teamIdIndex, excelRowNumber, "team_id");
            SportsTeam team = null;
            if (teamId != null) {
                team = teamsById.get(teamId);
                if (team == null) {
                    throw new IllegalArgumentException("엑셀 " + excelRowNumber + "행의 team_id를 찾을 수 없습니다.");
                }
                if (!team.getSportType().equals(cardProduct.getSportType())) {
                    throw new IllegalArgumentException("엑셀 " + excelRowNumber + "행의 팀 종목과 상품 종목이 일치해야 합니다.");
                }
            }

            String teamOriginal = readString(row, teamOriginalIndex);
            String matchedTeamName = readString(row, matchedTeamNameIndex);
            String teamName = normalize(matchedTeamName, normalize(teamOriginal, team == null ? null : team.getName()));
            String matchNote = readString(row, matchNoteIndex);
            String cardType = readString(row, cardTypeIndex);

            checklistItems.add(new CardProductChecklistItem(
                    cardProduct,
                    sectionName,
                    readInteger(row, sourcePageIndex, excelRowNumber, "source_page"),
                    readString(row, topCategoryIndex),
                    cardType,
                    cardNumber,
                    playerName,
                    team,
                    teamName,
                    teamOriginal,
                    matchedTeamName,
                    matchNote,
                    cardType,
                    readBoolean(row, rookieIndex, excelRowNumber, "is_rookie"),
                    readBoolean(row, autographIndex, excelRowNumber, "is_autograph"),
                    readBoolean(row, memorabiliaIndex, excelRowNumber, "is_memorabilia"),
                    readBoolean(row, variationIndex, excelRowNumber, "is_variation"),
                    matchNote));
        }

        return checklistItems;
    }

    private List<String> getRow(XlsxSheet sheet, int rowIndex) {
        return rowIndex < sheet.rows().size() ? sheet.rows().get(rowIndex) : null;
    }

    private Map<String, Integer> getHeaderIndexes(List<String> headerRow) {
        Map<String, Integer> headerIndexes = new HashMap<>();
        if (headerRow == null) {
            return headerIndexes;
        }

        for (int index = 0; index < headerRow.size(); index++) {
            String header = normalizeHeader(headerRow.get(index));
            if (header != null) {
                headerIndexes.put(header, index);
            }
        }

        return headerIndexes;
    }

    private int requireHeader(Map<String, Integer> headerIndexes, String headerName) {
        Integer index = headerIndexes.get(headerName);
        if (index == null) {
            throw new IllegalArgumentException("엑셀 헤더 `" + headerName + "`이 필요합니다.");
        }

        return index;
    }

    private void validateRequiredCell(String value, int excelRowNumber, String headerName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("엑셀 " + excelRowNumber + "행의 `" + headerName + "` 값이 필요합니다.");
        }
    }

    private String readString(List<String> row, int cellIndex) {
        if (cellIndex < 0 || cellIndex >= row.size()) {
            return null;
        }

        return normalize(row.get(cellIndex), null);
    }

    private Integer readInteger(
            List<String> row,
            int cellIndex,
            int excelRowNumber,
            String headerName) {
        Long value = readLong(row, cellIndex, excelRowNumber, headerName);
        if (value == null) {
            return null;
        }
        if (value > Integer.MAX_VALUE || value < Integer.MIN_VALUE) {
            throw new IllegalArgumentException("엑셀 " + excelRowNumber + "행의 `" + headerName + "` 값이 너무 큽니다.");
        }

        return value.intValue();
    }

    private Long readLong(
            List<String> row,
            int cellIndex,
            int excelRowNumber,
            String headerName) {
        String value = readString(row, cellIndex);
        if (value == null) {
            return null;
        }

        try {
            return new BigDecimal(value.replace(",", "")).longValueExact();
        } catch (ArithmeticException | NumberFormatException e) {
            throw new IllegalArgumentException("엑셀 " + excelRowNumber + "행의 `" + headerName + "` 값은 숫자여야 합니다.");
        }
    }

    private Boolean readBoolean(
            List<String> row,
            int cellIndex,
            int excelRowNumber,
            String headerName) {
        if (cellIndex < 0) {
            return false;
        }

        String value = readString(row, cellIndex);
        if (value == null) {
            return false;
        }

        String normalizedValue = value.trim().toLowerCase();
        if (Set.of("true", "1", "yes", "y", "o").contains(normalizedValue)) {
            return true;
        }
        if (Set.of("false", "0", "no", "n", "x").contains(normalizedValue)) {
            return false;
        }

        throw new IllegalArgumentException("엑셀 " + excelRowNumber + "행의 `" + headerName + "` 값은 true/false 형식이어야 합니다.");
    }

    private String normalizeHeader(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().toLowerCase();
    }

    private record XlsxSheet(String name, List<List<String>> rows) {
    }

    private record CellAddress(int rowIndex, int columnIndex) {
    }

    private void validatePositive(Integer value, String label) {
        if (value != null && value <= 0) {
            throw new IllegalArgumentException(label + "는 1 이상이어야 합니다.");
        }
    }

    private void validatePositive(BigDecimal value, String label) {
        if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(label + "은 0 이상이어야 합니다.");
        }
    }

    private String normalizeRequired(String value, String errorMessage) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(errorMessage);
        }

        return value.trim();
    }

    private String normalize(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }

        return value.trim();
    }
}
