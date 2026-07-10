package com.pyt.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;

import com.pyt.config.JwtTokenProvider;
import com.pyt.dto.pyt.req.PytCreateReqDto;
import com.pyt.dto.pyt.req.PytFillerCreateReqDto;
import com.pyt.dto.pyt.req.PytTeamPriceReqDto;
import com.pyt.dto.pyt.req.PytUpdateReqDto;
import com.pyt.dto.pyt.resp.PytCreateDataRespDto;
import com.pyt.dto.pyt.resp.PytDetailRespDto;
import com.pyt.dto.pyt.resp.PytFillerEntryRespDto;
import com.pyt.dto.pyt.resp.PytFillerRespDto;
import com.pyt.dto.pyt.resp.PytListItemRespDto;
import com.pyt.dto.pyt.resp.PytProductOptionRespDto;
import com.pyt.dto.pyt.resp.PytTeamRespDto;
import com.pyt.dto.pyt.resp.PytTeamSlotRespDto;
import com.pyt.dto.pyt.resp.PytUploadRespDto;
import com.pyt.dto.pyt.resp.PytUploadRespDto.PytUploadItemRespDto;
import com.pyt.dto.pyt.resp.PytUploadRespDto.PytUploadTeamPriceRespDto;
import com.pyt.entities.CardProductOption;
import com.pyt.entities.PytBreak;
import com.pyt.entities.PytEntry;
import com.pyt.entities.PytFiller;
import com.pyt.entities.PytFillerEntry;
import com.pyt.entities.PytFillerTeam;
import com.pyt.entities.PytTeamSlot;
import com.pyt.entities.SportsTeam;
import com.pyt.entities.User;
import com.pyt.enums.BreakUnitType;
import com.pyt.enums.FillerStatus;
import com.pyt.enums.PytEntryStatus;
import com.pyt.enums.PytStatus;
import com.pyt.enums.PytTeamSlotStatus;
import com.pyt.enums.SportType;
import com.pyt.enums.UserRoleType;
import com.pyt.repository.CardProductOptionRepository;
import com.pyt.repository.PytBreakRepository;
import com.pyt.repository.PytEntryRepository;
import com.pyt.repository.PytFillerEntryRepository;
import com.pyt.repository.PytFillerRepository;
import com.pyt.repository.PytFillerTeamRepository;
import com.pyt.repository.PytTeamSlotRepository;
import com.pyt.repository.SportsTeamRepository;
import com.pyt.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PytService {

    private static final int TITLE_ROW_INDEX = 2;
    private static final int BREAK_UNIT_ROW_INDEX = 4;
    private static final int BOX_COUNT_ROW_INDEX = 5;
    private static final int ROUND_NO_ROW_INDEX = 6;
    private static final int TOTAL_PRICE_ROW_INDEX = 7;
    private static final int VALUE_COLUMN_INDEX = 1;

    private final PytBreakRepository pytBreakRepository;
    private final PytTeamSlotRepository pytTeamSlotRepository;
    private final PytEntryRepository pytEntryRepository;
    private final PytFillerRepository pytFillerRepository;
    private final PytFillerEntryRepository pytFillerEntryRepository;
    private final PytFillerTeamRepository pytFillerTeamRepository;
    private final CardProductOptionRepository cardProductOptionRepository;
    private final SportsTeamRepository sportsTeamRepository;
    private final UserRepository userRepository;
    private final SellerAuthorizationService sellerAuthorizationService;
    private final XlsxWorkbookReader xlsxWorkbookReader;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public List<PytListItemRespDto> getPytList() {
        return pytBreakRepository.findAllWithProductOrderByCreatedAtDesc()
                .stream()
                .map(pytBreak -> new PytListItemRespDto(
                        pytBreak,
                        Math.toIntExact(pytTeamSlotRepository.countPublicByPytBreakId(pytBreak.getId())),
                        Math.toIntExact(pytTeamSlotRepository.countAvailableByPytBreakId(pytBreak.getId()))))
                .toList();
    }

    @Transactional(readOnly = true)
    public PytCreateDataRespDto getCreateData() {
        List<PytProductOptionRespDto> productOptions = cardProductOptionRepository.findAllByOrderByIdAsc()
                .stream()
                .map(PytProductOptionRespDto::new)
                .toList();

        List<PytTeamRespDto> teams = sportsTeamRepository.findAllByOrderBySportTypeAscLeagueLevelTypeAscNameAsc()
                .stream()
                .map(PytTeamRespDto::new)
                .toList();

        return new PytCreateDataRespDto(productOptions, teams);
    }

    @Transactional(readOnly = true)
    public PytDetailRespDto getPytDetail(Long pytId) {
        PytBreak pytBreak = pytBreakRepository.findDetailById(pytId)
                .orElseThrow(() -> new IllegalArgumentException("PYT를 찾을 수 없습니다."));

        List<PytTeamSlotRespDto> teamSlots = pytTeamSlotRepository.findPublicWithTeamAndBuyerUserByPytBreakId(pytId)
                .stream()
                .map(PytTeamSlotRespDto::new)
                .toList();

        return new PytDetailRespDto(pytBreak, teamSlots, buildFillerResponses(pytId));
    }

    @Transactional(readOnly = true)
    public List<PytListItemRespDto> getSellerPytList(String authorizationHeader) {
        sellerAuthorizationService.validateSellerAuthorization(authorizationHeader);
        return getPytList();
    }

    @Transactional(readOnly = true)
    public PytDetailRespDto getSellerPytDetail(String authorizationHeader, Long pytId) {
        sellerAuthorizationService.validateSellerAuthorization(authorizationHeader);

        PytBreak pytBreak = pytBreakRepository.findDetailById(pytId)
                .orElseThrow(() -> new IllegalArgumentException("PYT를 찾을 수 없습니다."));

        List<PytTeamSlotRespDto> teamSlots = pytTeamSlotRepository.findWithTeamAndBuyerUserByPytBreakId(pytId)
                .stream()
                .map(PytTeamSlotRespDto::new)
                .toList();

        return new PytDetailRespDto(pytBreak, teamSlots, buildFillerResponses(pytId));
    }

    @Transactional
    public PytDetailRespDto updatePyt(
            String authorizationHeader,
            Long pytId,
            PytUpdateReqDto reqDto) {
        sellerAuthorizationService.validateSellerAuthorization(authorizationHeader);
        validateUpdateRequest(reqDto);

        PytBreak pytBreak = pytBreakRepository.findDetailById(pytId)
                .orElseThrow(() -> new IllegalArgumentException("PYT를 찾을 수 없습니다."));
        CardProductOption cardProductOption = cardProductOptionRepository
                .findWithCardProductById(reqDto.getCardProductOptionId())
                .orElseThrow(() -> new IllegalArgumentException("상품 옵션을 찾을 수 없습니다."));
        validateProductOptionMatchesTeamSport(pytBreak, cardProductOption);

        pytBreak.setCardProductOption(cardProductOption);
        pytBreak.setTitle(reqDto.getTitle().trim());
        pytBreak.setBreakUnitType(parseBreakUnitType(reqDto.getBreakUnitType()));
        pytBreak.setRoundNo(reqDto.getRoundNo());
        pytBreak.setBoxCount(reqDto.getBoxCount());
        pytBreak.setFillerEnabled(true);

        if (reqDto.getTeamPrices() != null) {
            updateTeamSlotPrices(pytBreak, reqDto.getTeamPrices());
        }

        List<PytTeamSlotRespDto> teamSlots = pytTeamSlotRepository.findWithTeamAndBuyerUserByPytBreakId(pytId)
                .stream()
                .map(PytTeamSlotRespDto::new)
                .toList();

        return new PytDetailRespDto(pytBreak, teamSlots, buildFillerResponses(pytId));
    }

    @Transactional
    public void deletePyt(String authorizationHeader, Long pytId) {
        sellerAuthorizationService.validateSellerAuthorization(authorizationHeader);

        PytBreak pytBreak = pytBreakRepository.findById(pytId)
                .orElseThrow(() -> new IllegalArgumentException("PYT를 찾을 수 없습니다."));

        if (pytEntryRepository.countByPytBreakId(pytId) > 0) {
            throw new IllegalArgumentException("구매 기록이 있는 PYT는 삭제할 수 없습니다.");
        }
        if (pytFillerRepository.countByPytBreakId(pytId) > 0) {
            throw new IllegalArgumentException("필러가 생성된 PYT는 삭제할 수 없습니다.");
        }

        List<PytTeamSlot> teamSlots = pytTeamSlotRepository.findByPytBreakIdOrderByIdAsc(pytId);
        pytTeamSlotRepository.deleteAll(teamSlots);
        pytBreakRepository.delete(pytBreak);
    }

    @Transactional
    public Long createPyt(String authorizationHeader, PytCreateReqDto reqDto) {
        String sellerUserId = sellerAuthorizationService.validateSellerAuthorizationAndGetUserId(authorizationHeader);
        User sellerUser = userRepository.findById(sellerUserId)
                .orElseThrow(() -> new IllegalArgumentException("셀러 사용자를 찾을 수 없습니다."));

        return createPytFromRequest(reqDto, sellerUser);
    }

    @Transactional(readOnly = true)
    public PytUploadRespDto previewPytExcel(
            String authorizationHeader,
            Long cardProductOptionId,
            MultipartFile file) {
        sellerAuthorizationService.validateSellerAuthorization(authorizationHeader);
        validatePytUploadFile(file);

        try {
            List<ParsedPytUploadSheet> parsedSheets = parsePytUploadSheets(cardProductOptionId, file);
            List<String> sheetNames = parsedSheets.stream()
                    .map(ParsedPytUploadSheet::sheetName)
                    .toList();
            List<PytUploadItemRespDto> items = parsedSheets.stream()
                    .map(parsedSheet -> toUploadItem(null, parsedSheet.sheetName(), parsedSheet.reqDto()))
                    .toList();

            return new PytUploadRespDto(List.of(), sheetNames, items);
        } catch (IOException | ParserConfigurationException | SAXException e) {
            throw new IllegalArgumentException("엑셀 파일을 읽을 수 없습니다.");
        }
    }

    @Transactional
    public PytUploadRespDto createPytFromExcel(
            String authorizationHeader,
            Long cardProductOptionId,
            MultipartFile file) {
        String sellerUserId = sellerAuthorizationService.validateSellerAuthorizationAndGetUserId(authorizationHeader);
        User sellerUser = userRepository.findById(sellerUserId)
                .orElseThrow(() -> new IllegalArgumentException("셀러 사용자를 찾을 수 없습니다."));
        validatePytUploadFile(file);

        try {
            List<ParsedPytUploadSheet> parsedSheets = parsePytUploadSheets(cardProductOptionId, file);
            List<Long> pytIds = new ArrayList<>();
            List<String> sheetNames = new ArrayList<>();
            List<PytUploadItemRespDto> items = new ArrayList<>();

            for (ParsedPytUploadSheet parsedSheet : parsedSheets) {
                PytCreateReqDto reqDto = parsedSheet.reqDto();
                Long pytId = createPytFromRequest(reqDto, sellerUser);
                pytIds.add(pytId);
                sheetNames.add(parsedSheet.sheetName());
                items.add(toUploadItem(pytId, parsedSheet.sheetName(), reqDto));
            }

            return new PytUploadRespDto(pytIds, sheetNames, items);
        } catch (IOException | ParserConfigurationException | SAXException e) {
            throw new IllegalArgumentException("엑셀 파일을 읽을 수 없습니다.");
        }
    }

    private List<ParsedPytUploadSheet> parsePytUploadSheets(
            Long cardProductOptionId,
            MultipartFile file)
            throws IOException, ParserConfigurationException, SAXException {
        if (cardProductOptionId == null) {
            throw new IllegalArgumentException("상품 옵션을 선택해주세요.");
        }

        CardProductOption cardProductOption = cardProductOptionRepository.findWithCardProductById(cardProductOptionId)
                .orElseThrow(() -> new IllegalArgumentException("상품 옵션을 선택해주세요."));
        if (cardProductOption.getCardProduct().getSportType() != SportType.BASEBALL) {
            throw new IllegalArgumentException("엑셀 등록은 야구 상품만 가능합니다.");
        }

        List<XlsxWorkbookReader.XlsxSheet> sheets = xlsxWorkbookReader.readSheets(file);
        List<ParsedPytUploadSheet> parsedSheets = new ArrayList<>();
        for (XlsxWorkbookReader.XlsxSheet sheet : sheets) {
            PytUploadTableRange tableRange = findPytUploadTableRange(sheet);
            if (tableRange == null) {
                continue;
            }
            if (isBlankPytUploadSheet(sheet, tableRange)) {
                continue;
            }

            parsedSheets.add(new ParsedPytUploadSheet(
                    sheet.name(),
                    parsePytUploadSheet(sheet, tableRange, cardProductOption)));
        }

        if (parsedSheets.isEmpty()) {
            throw new IllegalArgumentException("저장할 PYT 정보가 입력된 시트를 찾을 수 없습니다.");
        }

        return parsedSheets;
    }

    private Long createPytFromRequest(PytCreateReqDto reqDto, User sellerUser) {
        validateCreateRequest(reqDto);

        CardProductOption cardProductOption = cardProductOptionRepository
                .findById(reqDto.getCardProductOptionId())
                .orElseThrow(() -> new IllegalArgumentException("상품 옵션을 찾을 수 없습니다."));

        BreakUnitType breakUnitType = parseBreakUnitType(reqDto.getBreakUnitType());

        PytBreak pytBreak = pytBreakRepository.save(new PytBreak(
                cardProductOption,
                sellerUser,
                reqDto.getTitle(),
                breakUnitType,
                reqDto.getRoundNo(),
                reqDto.getBoxCount(),
                true,
                PytStatus.OPEN));

        List<PytTeamSlot> teamSlots = new ArrayList<>();
        for (PytTeamPriceReqDto teamPrice : reqDto.getTeamPrices()) {
            validateTeamPrice(teamPrice);

            SportsTeam team = sportsTeamRepository.findById(teamPrice.getTeamId())
                    .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

            if (!team.getSportType().equals(cardProductOption.getCardProduct().getSportType())) {
                throw new IllegalArgumentException("상품 종목과 팀 종목이 일치해야 합니다.");
            }

            teamSlots.add(new PytTeamSlot(
                    pytBreak,
                    team,
                    teamPrice.getPrice(),
                    PytTeamSlotStatus.AVAILABLE,
                    teamPrice.getFillerOnly()));
        }

        pytTeamSlotRepository.saveAll(teamSlots);

        return pytBreak.getId();
    }

    private void validatePytUploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 엑셀 파일을 선택해주세요.");
        }

        String filename = file.getOriginalFilename();
        String lowerFilename = filename == null ? "" : filename.toLowerCase(Locale.ROOT);
        if (!lowerFilename.endsWith(".xlsx") && !lowerFilename.endsWith(".xlsm")) {
            throw new IllegalArgumentException("엑셀 파일은 .xlsx 또는 .xlsm 형식만 업로드할 수 있습니다.");
        }
    }

    private PytUploadTableRange findPytUploadTableRange(XlsxWorkbookReader.XlsxSheet sheet) {
        for (int rowIndex = 0; rowIndex < sheet.rows().size(); rowIndex++) {
            List<String> row = sheet.rows().get(rowIndex);
            int teamIdColumnIndex = -1;
            int teamNameColumnIndex = -1;
            int teamPriceColumnIndex = -1;
            int fillerOnlyColumnIndex = -1;

            for (int cellIndex = 0; cellIndex < row.size(); cellIndex++) {
                String header = normalizeHeader(row.get(cellIndex));
                if (header == null) {
                    continue;
                }

                if ("팀id".equals(header) || "teamid".equals(header)) {
                    teamIdColumnIndex = cellIndex;
                } else if ("팀명".equals(header) || "teamname".equals(header) || "팀".equals(header)) {
                    teamNameColumnIndex = cellIndex;
                } else if ("판매가".equals(header) || "price".equals(header) || "가격".equals(header)) {
                    teamPriceColumnIndex = cellIndex;
                } else if ("필러용".equals(header)
                        || "필러전용".equals(header)
                        || "filler".equals(header)
                        || "filleronly".equals(header)) {
                    fillerOnlyColumnIndex = cellIndex;
                }
            }

            if (teamIdColumnIndex >= 0 && teamNameColumnIndex >= 0 && teamPriceColumnIndex >= 0) {
                return new PytUploadTableRange(
                        rowIndex,
                        teamIdColumnIndex,
                        teamNameColumnIndex,
                        teamPriceColumnIndex,
                        fillerOnlyColumnIndex);
            }
        }

        return null;
    }

    private boolean isBlankPytUploadSheet(
            XlsxWorkbookReader.XlsxSheet sheet,
            PytUploadTableRange tableRange) {
        return readCell(sheet, TITLE_ROW_INDEX, VALUE_COLUMN_INDEX) == null
                && !hasAnyTeamPrice(sheet, tableRange);
    }

    private boolean hasAnyTeamPrice(
            XlsxWorkbookReader.XlsxSheet sheet,
            PytUploadTableRange tableRange) {
        for (int rowIndex = tableRange.headerRowIndex() + 1; rowIndex < sheet.rows().size(); rowIndex++) {
            if (readCell(sheet, rowIndex, tableRange.teamPriceColumnIndex()) != null) {
                return true;
            }
        }

        return false;
    }

    private PytCreateReqDto parsePytUploadSheet(
            XlsxWorkbookReader.XlsxSheet sheet,
            PytUploadTableRange tableRange,
            CardProductOption productOption) {
        String sheetLabel = "`" + sheet.name() + "` 시트";
        String title = requireCell(sheet, TITLE_ROW_INDEX, VALUE_COLUMN_INDEX, sheetLabel + " B3 브레이크 제목");
        String breakUnitValue = requireCell(
                sheet,
                BREAK_UNIT_ROW_INDEX,
                VALUE_COLUMN_INDEX,
                sheetLabel + " B5 진행 단위");

        Integer boxCount = readRequiredInteger(sheet, BOX_COUNT_ROW_INDEX, VALUE_COLUMN_INDEX, sheetLabel + " B6 박스 수");
        Integer roundNo = readRequiredInteger(sheet, ROUND_NO_ROW_INDEX, VALUE_COLUMN_INDEX, sheetLabel + " B7 차수");
        BigDecimal declaredTotalPrice = readRequiredPrice(
                sheet,
                TOTAL_PRICE_ROW_INDEX,
                VALUE_COLUMN_INDEX,
                sheetLabel + " B8 전체 판매가");

        Map<Long, SportsTeam> teamsById = new HashMap<>();
        for (SportsTeam team : sportsTeamRepository.findAll()) {
            teamsById.put(team.getId(), team);
        }

        Set<Long> teamIds = new HashSet<>();
        List<PytTeamPriceReqDto> teamPrices = new ArrayList<>();
        BigDecimal teamPriceTotal = BigDecimal.ZERO;

        for (int rowIndex = tableRange.headerRowIndex() + 1; rowIndex < sheet.rows().size(); rowIndex++) {
            String teamIdValue = readCell(sheet, rowIndex, tableRange.teamIdColumnIndex());
            String teamNameValue = readCell(sheet, rowIndex, tableRange.teamNameColumnIndex());
            String priceValue = readCell(sheet, rowIndex, tableRange.teamPriceColumnIndex());
            String fillerOnlyValue = tableRange.fillerOnlyColumnIndex() >= 0
                    ? readCell(sheet, rowIndex, tableRange.fillerOnlyColumnIndex())
                    : null;
            if (teamIdValue == null && teamNameValue == null && priceValue == null) {
                continue;
            }

            int excelRowNumber = rowIndex + 1;
            Long teamId = readRequiredLong(teamIdValue, sheetLabel + " A" + excelRowNumber + " 팀 ID");
            if (!teamIds.add(teamId)) {
                throw new IllegalArgumentException(sheetLabel + " A" + excelRowNumber + " 팀 ID가 중복되었습니다.");
            }

            SportsTeam team = teamsById.get(teamId);
            if (team == null) {
                throw new IllegalArgumentException(sheetLabel + " A" + excelRowNumber + " 팀 ID를 찾을 수 없습니다.");
            }
            if (team.getSportType() != SportType.BASEBALL) {
                throw new IllegalArgumentException(sheetLabel + " A" + excelRowNumber + " 팀은 야구 팀만 사용할 수 있습니다.");
            }

            BigDecimal price = readRequiredPrice(priceValue, sheetLabel + " C" + excelRowNumber + " 판매가");
            PytTeamPriceReqDto teamPrice = new PytTeamPriceReqDto();
            teamPrice.setTeamId(teamId);
            teamPrice.setPrice(price);
            teamPrice.setFillerOnly(readOptionalBoolean(fillerOnlyValue));
            teamPrices.add(teamPrice);
            teamPriceTotal = teamPriceTotal.add(price);
        }

        if (teamPrices.isEmpty()) {
            throw new IllegalArgumentException(sheetLabel + " 저장할 팀 가격 정보가 없습니다.");
        }
        if (declaredTotalPrice.compareTo(teamPriceTotal) != 0) {
            throw new IllegalArgumentException(sheetLabel + " 전체 판매가와 팀 판매가 합계가 일치하지 않습니다.");
        }

        PytCreateReqDto reqDto = new PytCreateReqDto();
        reqDto.setCardProductOptionId(productOption.getId());
        reqDto.setTitle(title);
        reqDto.setBreakUnitType(parseBreakUnitTypeLabel(breakUnitValue).name());
        reqDto.setRoundNo(roundNo);
        reqDto.setBoxCount(boxCount);
        reqDto.setFillerEnabled(true);
        reqDto.setTeamPrices(teamPrices);

        return reqDto;
    }

    private BreakUnitType parseBreakUnitTypeLabel(String value) {
        String normalizedValue = value.trim()
                .toUpperCase(Locale.ROOT)
                .replaceAll("[\\s_-]+", "");

        return switch (normalizedValue) {
            case "FULLCASE", "1CASE", "ONECASE", "한케이스", "한개케이스", "풀케이스" -> BreakUnitType.FULL_CASE;
            case "HALFCASE", "반케이스", "하프케이스" -> BreakUnitType.HALF_CASE;
            case "BOX", "1BOX", "박스", "단일박스" -> BreakUnitType.BOX;
            case "CUSTOM", "직접입력", "커스텀" -> BreakUnitType.CUSTOM;
            default -> parseBreakUnitType(value);
        };
    }

    private String requireCell(
            XlsxWorkbookReader.XlsxSheet sheet,
            int rowIndex,
            int cellIndex,
            String label) {
        String value = readCell(sheet, rowIndex, cellIndex);
        if (value == null) {
            throw new IllegalArgumentException(label + " 값이 필요합니다.");
        }

        return value;
    }

    private String readCell(XlsxWorkbookReader.XlsxSheet sheet, int rowIndex, int cellIndex) {
        if (rowIndex < 0 || rowIndex >= sheet.rows().size()) {
            return null;
        }

        List<String> row = sheet.rows().get(rowIndex);
        if (cellIndex < 0 || cellIndex >= row.size()) {
            return null;
        }

        return normalize(row.get(cellIndex), null);
    }

    private Integer readRequiredInteger(
            XlsxWorkbookReader.XlsxSheet sheet,
            int rowIndex,
            int cellIndex,
            String label) {
        return readRequiredInteger(readCell(sheet, rowIndex, cellIndex), label);
    }

    private Integer readRequiredInteger(String value, String label) {
        Long longValue = readRequiredLong(value, label);
        if (longValue > Integer.MAX_VALUE || longValue < Integer.MIN_VALUE) {
            throw new IllegalArgumentException(label + " 값이 너무 큽니다.");
        }

        return longValue.intValue();
    }

    private Long readRequiredLong(String value, String label) {
        Long longValue = tryReadLong(value);
        if (longValue == null) {
            throw new IllegalArgumentException(label + " 값은 숫자여야 합니다.");
        }

        return longValue;
    }

    private Long tryReadLong(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return new BigDecimal(value.replace(",", "")).longValueExact();
        } catch (ArithmeticException | NumberFormatException e) {
            return null;
        }
    }

    private Boolean readOptionalBoolean(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        String normalizedValue = value.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[\\s_\\-]+", "");

        return switch (normalizedValue) {
            case "true", "yes", "y", "1", "o", "ok", "필러", "필러용", "필러전용", "ㅇ" -> true;
            default -> false;
        };
    }

    private BigDecimal readRequiredPrice(
            XlsxWorkbookReader.XlsxSheet sheet,
            int rowIndex,
            int cellIndex,
            String label) {
        return readRequiredPrice(readCell(sheet, rowIndex, cellIndex), label);
    }

    private BigDecimal readRequiredPrice(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " 값이 필요합니다.");
        }

        try {
            BigDecimal price = new BigDecimal(value.replace(",", ""));
            if (price.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException(label + " 값은 0보다 커야 합니다.");
            }
            if (price.scale() > 2) {
                throw new IllegalArgumentException(label + " 값은 소수점 둘째 자리까지만 입력할 수 있습니다.");
            }

            return price.setScale(2);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(label + " 값은 숫자여야 합니다.");
        }
    }

    private String normalize(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }

        return value.trim();
    }

    private String normalizeHeader(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[\\s_\\-]+", "");
    }

    private PytUploadItemRespDto toUploadItem(Long pytId, String sheetName, PytCreateReqDto reqDto) {
        List<Long> teamIds = reqDto.getTeamPrices()
                .stream()
                .map(PytTeamPriceReqDto::getTeamId)
                .toList();
        Map<Long, SportsTeam> teamsById = new HashMap<>();
        for (SportsTeam team : sportsTeamRepository.findAllById(teamIds)) {
            teamsById.put(team.getId(), team);
        }

        List<PytUploadTeamPriceRespDto> teamPrices = reqDto.getTeamPrices()
                .stream()
                .map(teamPrice -> {
                    SportsTeam team = teamsById.get(teamPrice.getTeamId());
                    return new PytUploadTeamPriceRespDto(
                            teamPrice.getTeamId(),
                            team == null ? "" : team.getName(),
                            team == null ? "" : team.getShortName(),
                            teamPrice.getPrice().toPlainString(),
                            teamPrice.getFillerOnly());
                })
                .toList();

        return new PytUploadItemRespDto(
                pytId,
                sheetName,
                reqDto.getTitle(),
                reqDto.getBreakUnitType(),
                reqDto.getRoundNo(),
                reqDto.getBoxCount(),
                teamPrices.size(),
                calculateTotalPrice(reqDto.getTeamPrices()).toPlainString(),
                teamPrices);
    }

    private BigDecimal calculateTotalPrice(List<PytTeamPriceReqDto> teamPrices) {
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (PytTeamPriceReqDto teamPrice : teamPrices) {
            totalPrice = totalPrice.add(teamPrice.getPrice());
        }

        return totalPrice;
    }

    private record ParsedPytUploadSheet(String sheetName, PytCreateReqDto reqDto) {
    }

    private record PytUploadTableRange(
            int headerRowIndex,
            int teamIdColumnIndex,
            int teamNameColumnIndex,
            int teamPriceColumnIndex,
            int fillerOnlyColumnIndex) {
    }

    @Transactional
    public void joinTeam(String authorizationHeader, Long pytId, Long teamSlotId) {
        String participantUserId = resolveParticipantUserId(authorizationHeader);

        PytBreak pytBreak = pytBreakRepository.findById(pytId)
                .orElseThrow(() -> new IllegalArgumentException("PYT를 찾을 수 없습니다."));

        User user = userRepository.findById(participantUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        validateNotPytOwner(pytBreak, user);
        if (pytBreak.getPytStatus() != PytStatus.OPEN) {
            throw new IllegalArgumentException("PYT 모집중 상태에서만 팀 직접 참가가 가능합니다.");
        }

        PytTeamSlot teamSlot = pytTeamSlotRepository.findById(teamSlotId)
                .orElseThrow(() -> new IllegalArgumentException("팀 슬롯을 찾을 수 없습니다."));

        if (!pytBreak.getId().equals(teamSlot.getPytBreak().getId())) {
            throw new IllegalArgumentException("해당 PYT의 팀 슬롯이 아닙니다.");
        }
        if (teamSlot.getSlotStatus() != PytTeamSlotStatus.AVAILABLE) {
            throw new IllegalArgumentException("구매 가능한 팀 슬롯이 아닙니다.");
        }
        if (Boolean.TRUE.equals(teamSlot.getFillerOnly())) {
            throw new IllegalArgumentException("필러 전용 팀은 직접 참가할 수 없습니다.");
        }

        teamSlot.setSlotStatus(PytTeamSlotStatus.SOLD);
        teamSlot.setBuyerUser(user);

        pytEntryRepository.save(new PytEntry(
                pytBreak,
                teamSlot,
                user,
                teamSlot.getPrice(),
                PytEntryStatus.PAID));

        // TODO: 전체 팀 판매 완료 후 PYT 상태를 SOLD_OUT/READY로 전환한다.
    }

    private String resolveParticipantUserId(String authorizationHeader) {
        String bearerPrefix = "Bearer ";
        if (authorizationHeader != null && authorizationHeader.startsWith(bearerPrefix)) {
            String token = authorizationHeader.substring(bearerPrefix.length()).trim();
            if (!token.isBlank()) {
                try {
                    return jwtTokenProvider.getUserId(token);
                } catch (Exception e) {
                    throw new IllegalArgumentException("유효하지 않은 인증 정보입니다.");
                }
            }
        }

        throw new IllegalArgumentException("로그인 후 참가할 수 있습니다.");
    }

    @Transactional
    public Long joinFiller(String authorizationHeader, Long pytId, Long fillerId) {
        String participantUserId = resolveParticipantUserId(authorizationHeader);

        PytFiller filler = pytFillerRepository.findById(fillerId)
                .orElseThrow(() -> new IllegalArgumentException("필러를 찾을 수 없습니다."));
        PytBreak pytBreak = filler.getPytBreak();

        if (!pytBreak.getId().equals(pytId)) {
            throw new IllegalArgumentException("해당 PYT의 필러가 아닙니다.");
        }
        if (pytBreak.getPytStatus() != PytStatus.FILLER_OPEN) {
            throw new IllegalArgumentException("필러 모집 중인 PYT만 필러 참가가 가능합니다.");
        }
        if (filler.getFillerStatus() != FillerStatus.OPEN) {
            throw new IllegalArgumentException("참가 가능한 필러가 아닙니다.");
        }

        User user = userRepository.findById(participantUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        validateNotPytOwner(pytBreak, user);

        if (pytFillerEntryRepository.existsByPytFillerIdAndUserId(fillerId, participantUserId)) {
            throw new IllegalArgumentException("이미 참가한 필러입니다.");
        }

        long entryCount = pytFillerEntryRepository.countByPytFillerId(fillerId);
        if (entryCount >= filler.getSlotCount()) {
            filler.setFillerStatus(FillerStatus.SOLD_OUT);
            throw new IllegalArgumentException("필러가 마감되었습니다.");
        }

        int slotNo = Math.toIntExact(entryCount + 1);
        PytFillerEntry entry = pytFillerEntryRepository.save(new PytFillerEntry(
                filler,
                user,
                slotNo,
                filler.getPricePerSlot(),
                PytEntryStatus.PAID));

        if (slotNo >= filler.getSlotCount()) {
            filler.setFillerStatus(FillerStatus.SOLD_OUT);
            boolean hasOtherOpenFiller = pytFillerRepository.existsByPytBreakIdAndIdNotAndFillerStatus(
                    pytId,
                    fillerId,
                    FillerStatus.OPEN);
            if (!hasOtherOpenFiller) {
                pytBreak.setPytStatus(PytStatus.FILLER_SOLD_OUT);
            }
        }

        return entry.getId();
    }

    private void validateNotPytOwner(PytBreak pytBreak, User user) {
        if (pytBreak.getCreatedByUser() != null
                && user.getId().equals(pytBreak.getCreatedByUser().getId())) {
            throw new IllegalArgumentException("본인이 생성한 PYT에는 참가할 수 없습니다.");
        }
        if (pytBreak.getCreatedByUser() == null && user.getUserRoleType() == UserRoleType.SELLER) {
            throw new IllegalArgumentException("생성자 정보가 없는 기존 PYT는 셀러 참가가 제한됩니다.");
        }
    }

    @Transactional
    public Long createFiller(
            String authorizationHeader,
            Long pytId,
            PytFillerCreateReqDto reqDto) {
        sellerAuthorizationService.validateSellerAuthorization(authorizationHeader);
        return createFiller(pytId, reqDto);
    }

    @Transactional
    public void cancelFiller(String authorizationHeader, Long pytId, Long fillerId) {
        sellerAuthorizationService.validateSellerAuthorization(authorizationHeader);

        PytFiller filler = pytFillerRepository.findById(fillerId)
                .orElseThrow(() -> new IllegalArgumentException("필러를 찾을 수 없습니다."));
        PytBreak pytBreak = filler.getPytBreak();

        if (!pytBreak.getId().equals(pytId)) {
            throw new IllegalArgumentException("해당 PYT의 필러가 아닙니다.");
        }
        if (pytFillerEntryRepository.countByPytFillerId(fillerId) > 0) {
            throw new IllegalArgumentException("필러 참가자가 있는 필러는 PYT 모집으로 되돌릴 수 없습니다.");
        }

        List<PytFillerTeam> fillerTeams = pytFillerTeamRepository.findByPytFillerIdOrderByIdAsc(fillerId);
        for (PytFillerTeam fillerTeam : fillerTeams) {
            PytTeamSlot teamSlot = fillerTeam.getPytTeamSlot();
            if (teamSlot.getSlotStatus() == PytTeamSlotStatus.FILLER_TARGET) {
                teamSlot.setSlotStatus(PytTeamSlotStatus.AVAILABLE);
            }
            teamSlot.setFillerTarget(false);
        }

        pytFillerTeamRepository.deleteAll(fillerTeams);
        pytFillerRepository.delete(filler);

        List<PytFiller> remainingFillers = pytFillerRepository.findByPytBreakIdOrderByIdAsc(pytId);
        if (remainingFillers.isEmpty()) {
            pytBreak.setPytStatus(PytStatus.OPEN);
            return;
        }

        boolean hasOpenFiller = remainingFillers.stream()
                .anyMatch(remainingFiller -> remainingFiller.getFillerStatus() == FillerStatus.OPEN);
        pytBreak.setPytStatus(hasOpenFiller ? PytStatus.FILLER_OPEN : PytStatus.FILLER_SOLD_OUT);
    }

    @Transactional
    public Long createFiller(Long pytId, PytFillerCreateReqDto reqDto) {
        validateFillerCreateRequest(reqDto);

        PytBreak pytBreak = pytBreakRepository.findById(pytId)
                .orElseThrow(() -> new IllegalArgumentException("PYT를 찾을 수 없습니다."));

        List<PytTeamSlot> teamSlots = pytTeamSlotRepository.findByPytBreakIdOrderByIdAsc(pytId)
                .stream()
                .filter(teamSlot -> teamSlot.getSlotStatus() == PytTeamSlotStatus.AVAILABLE)
                .toList();

        int teamsPerSlot = reqDto.getTeamsPerSlot();
        int targetTeamCount = teamSlots.size();
        if (targetTeamCount == 0) {
            throw new IllegalArgumentException("필러 전환할 남은 팀이 없습니다.");
        }
        if (targetTeamCount % teamsPerSlot != 0) {
            throw new IllegalArgumentException("남은 팀 수가 슬롯당 팀 수로 나누어 떨어져야 합니다.");
        }
        int slotCount = targetTeamCount / teamsPerSlot;
        int fillerRoundNo = resolveFillerRoundNo(pytBreak.getId(), reqDto.getFillerRoundNo());
        validateFillerBoxCount(pytBreak, reqDto.getBoxCount());

        BigDecimal totalTeamPrice = BigDecimal.ZERO;
        for (PytTeamSlot teamSlot : teamSlots) {
            totalTeamPrice = totalTeamPrice.add(teamSlot.getPrice());
        }

        BigDecimal pricePerSlot = totalTeamPrice
                .divide(BigDecimal.valueOf(slotCount), 0, RoundingMode.CEILING)
                .setScale(2);

        PytFiller filler = pytFillerRepository.save(new PytFiller(
                pytBreak,
                buildFillerTitle(pytBreak, fillerRoundNo),
                fillerRoundNo,
                reqDto.getBoxCount(),
                teamsPerSlot,
                slotCount,
                pricePerSlot,
                totalTeamPrice,
                FillerStatus.OPEN));

        List<PytFillerTeam> fillerTeams = new ArrayList<>();
        for (PytTeamSlot teamSlot : teamSlots) {
            teamSlot.setSlotStatus(PytTeamSlotStatus.FILLER_TARGET);
            teamSlot.setFillerTarget(true);
            fillerTeams.add(new PytFillerTeam(filler, teamSlot));
        }

        pytFillerTeamRepository.saveAll(fillerTeams);
        pytBreak.setPytStatus(PytStatus.FILLER_OPEN);

        return filler.getId();
    }

    private Integer resolveFillerRoundNo(Long pytId, Integer requestedFillerRoundNo) {
        int fillerRoundNo = requestedFillerRoundNo == null
                ? pytFillerRepository.findMaxFillerRoundNoByPytBreakId(pytId) + 1
                : requestedFillerRoundNo;

        if (pytFillerRepository.existsByPytBreakIdAndFillerRoundNo(pytId, fillerRoundNo)) {
            throw new IllegalArgumentException("이미 등록된 필러 차수입니다.");
        }

        return fillerRoundNo;
    }

    private void validateFillerBoxCount(PytBreak pytBreak, Integer boxCount) {
        if (boxCount == null || boxCount <= 0) {
            throw new IllegalArgumentException("필러 진행 박스 수는 1 이상이어야 합니다.");
        }

        if (pytBreak.getBoxCount() == null) {
            return;
        }

        long usedBoxCount = pytFillerRepository.sumBoxCountByPytBreakId(pytBreak.getId());
        if (usedBoxCount + boxCount > pytBreak.getBoxCount()) {
            throw new IllegalArgumentException("필러 진행 박스 수 합계가 PYT 박스 수를 초과할 수 없습니다.");
        }
    }

    private String buildFillerTitle(PytBreak pytBreak, Integer fillerRoundNo) {
        String roundLabel = pytBreak.getRoundNo() + "-" + fillerRoundNo + "차";
        String title = (pytBreak.getTitle() + " " + roundLabel + " Filler").trim();
        return title.length() > 200 ? title.substring(0, 200) : title;
    }

    private List<PytFillerRespDto> buildFillerResponses(Long pytId) {
        return pytFillerRepository.findByPytBreakIdOrderByIdAsc(pytId)
                .stream()
                .map(filler -> {
                    List<PytTeamSlotRespDto> targetTeamSlots = pytFillerTeamRepository
                            .findByPytFillerIdOrderByIdAsc(filler.getId())
                            .stream()
                            .map(PytFillerTeam::getPytTeamSlot)
                            .map(PytTeamSlotRespDto::new)
                            .toList();
                    List<PytFillerEntryRespDto> entries = pytFillerEntryRepository
                            .findWithUserByPytFillerIdOrderBySlotNoAsc(filler.getId())
                            .stream()
                            .map(PytFillerEntryRespDto::new)
                            .toList();

                    return new PytFillerRespDto(filler, targetTeamSlots, entries);
                })
                .toList();
    }

    private void updateTeamSlotPrices(PytBreak pytBreak, List<PytTeamPriceReqDto> teamPrices) {
        Map<Long, BigDecimal> pricesByTeamId = new HashMap<>();
        Map<Long, Boolean> fillerOnlyByTeamId = new HashMap<>();
        for (PytTeamPriceReqDto teamPrice : teamPrices) {
            validateTeamPrice(teamPrice);
            if (pricesByTeamId.put(teamPrice.getTeamId(), teamPrice.getPrice()) != null) {
                throw new IllegalArgumentException("중복된 팀 가격 정보가 있습니다.");
            }
            fillerOnlyByTeamId.put(teamPrice.getTeamId(), Boolean.TRUE.equals(teamPrice.getFillerOnly()));
        }

        List<PytTeamSlot> teamSlots = pytTeamSlotRepository.findByPytBreakIdOrderByIdAsc(pytBreak.getId());
        for (PytTeamSlot teamSlot : teamSlots) {
            BigDecimal nextPrice = pricesByTeamId.get(teamSlot.getTeam().getId());
            if (nextPrice == null) {
                throw new IllegalArgumentException("모든 팀 가격을 입력해주세요.");
            }

            boolean nextFillerOnly = Boolean.TRUE.equals(fillerOnlyByTeamId.get(teamSlot.getTeam().getId()));
            boolean fillerOnlyChanged = Boolean.TRUE.equals(teamSlot.getFillerOnly()) != nextFillerOnly;
            if (teamSlot.getSlotStatus() != PytTeamSlotStatus.AVAILABLE
                    && (teamSlot.getPrice().compareTo(nextPrice) != 0 || fillerOnlyChanged)) {
                throw new IllegalArgumentException("판매 완료 또는 필러 전환된 팀은 가격이나 필러 전용 여부를 수정할 수 없습니다.");
            }

            teamSlot.setPrice(nextPrice);
            teamSlot.setFillerOnly(nextFillerOnly);
        }
    }

    private void validateProductOptionMatchesTeamSport(PytBreak pytBreak, CardProductOption cardProductOption) {
        SportType productSportType = cardProductOption.getCardProduct().getSportType();
        List<PytTeamSlot> teamSlots = pytTeamSlotRepository.findByPytBreakIdOrderByIdAsc(pytBreak.getId());

        for (PytTeamSlot teamSlot : teamSlots) {
            if (!teamSlot.getTeam().getSportType().equals(productSportType)) {
                throw new IllegalArgumentException("상품 종목과 팀 종목이 일치해야 합니다.");
            }
        }
    }

    private void validateCreateRequest(PytCreateReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("PYT 등록 요청이 필요합니다.");
        }
        if (reqDto.getCardProductOptionId() == null) {
            throw new IllegalArgumentException("상품 옵션 ID가 필요합니다.");
        }
        if (reqDto.getTitle() == null || reqDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("PYT 제목이 필요합니다.");
        }
        if (reqDto.getBreakUnitType() == null || reqDto.getBreakUnitType().isBlank()) {
            throw new IllegalArgumentException("브레이크 단위가 필요합니다.");
        }
        if (reqDto.getRoundNo() == null) {
            throw new IllegalArgumentException("차수 정보가 필요합니다.");
        }
        if (reqDto.getTeamPrices() == null || reqDto.getTeamPrices().isEmpty()) {
            throw new IllegalArgumentException("팀 가격 정보가 필요합니다.");
        }
    }

    private void validateFillerCreateRequest(PytFillerCreateReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("필러 생성 요청이 필요합니다.");
        }
        if (reqDto.getFillerRoundNo() != null && reqDto.getFillerRoundNo() <= 0) {
            throw new IllegalArgumentException("필러 차수는 1 이상이어야 합니다.");
        }
        if (reqDto.getBoxCount() == null || reqDto.getBoxCount() <= 0) {
            throw new IllegalArgumentException("필러 진행 박스 수는 1 이상이어야 합니다.");
        }
        if (reqDto.getTeamsPerSlot() == null || reqDto.getTeamsPerSlot() <= 0) {
            throw new IllegalArgumentException("슬롯당 팀 수는 1 이상이어야 합니다.");
        }
    }

    private void validateUpdateRequest(PytUpdateReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("PYT 수정 요청이 필요합니다.");
        }
        if (reqDto.getCardProductOptionId() == null) {
            throw new IllegalArgumentException("상품 옵션 ID가 필요합니다.");
        }
        if (reqDto.getTitle() == null || reqDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("PYT 제목이 필요합니다.");
        }
        if (reqDto.getBreakUnitType() == null || reqDto.getBreakUnitType().isBlank()) {
            throw new IllegalArgumentException("브레이크 단위가 필요합니다.");
        }
        if (reqDto.getRoundNo() == null || reqDto.getRoundNo() <= 0) {
            throw new IllegalArgumentException("차수 정보는 1 이상이어야 합니다.");
        }
        if (reqDto.getBoxCount() != null && reqDto.getBoxCount() <= 0) {
            throw new IllegalArgumentException("박스 수는 1 이상이어야 합니다.");
        }
    }

    private void validateTeamPrice(PytTeamPriceReqDto teamPrice) {
        if (teamPrice == null || teamPrice.getTeamId() == null) {
            throw new IllegalArgumentException("팀 ID가 필요합니다.");
        }
        if (teamPrice.getPrice() == null) {
            throw new IllegalArgumentException("팀 가격이 필요합니다.");
        }
        if (teamPrice.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("팀 가격은 0보다 커야 합니다.");
        }
    }

    private BreakUnitType parseBreakUnitType(String breakUnitType) {
        try {
            return BreakUnitType.valueOf(breakUnitType.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 브레이크 단위입니다.");
        }
    }
}
