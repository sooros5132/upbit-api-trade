import React, { memo, useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import isEqual from 'react-fast-compare';
import { BiUpArrowAlt, BiDownArrowAlt } from 'react-icons/bi';
import { IUpbitForex, IUpbitSocketMessageTickerSimple } from 'src/types/upbit';
import {
  BackgroundRedBox,
  CursorPointerBox,
  FlexAlignItemsCenterBox,
  FlexBox,
  FlexCursorPointerBox,
  FlexJustifyContentCenterBox,
  FlexJustifyContentFlexEndBox,
  FlexNoWrapBox,
  FlexSpaceBetweenCenterBox,
  MonoFontBox,
  NoWrapBox,
  TextAlignCenterBox,
  TextAlignRightBox
} from '../modules/Box';
import { koPriceLabelFormat, timeForToday } from 'src/utils/utils';
import { NextSeo } from 'next-seo';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Tooltip,
  Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { AskBidTypography } from '../modules/Typography';
import { clientApiUrls } from 'src/utils/clientApiUrls';
import { AiOutlineAreaChart, AiFillStar } from 'react-icons/ai';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { krwRegex, marketRegex } from 'src/utils/regex';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import { useTradingViewSettingStore } from 'src/store/tradingViewSetting';
import shallow from 'zustand/shallow';
import { RiCloseCircleLine } from 'react-icons/ri';
import { GoPrimitiveDot } from 'react-icons/go';
import dateAndTime from 'date-and-time';

const TableContainer = styled('div')`
  margin: 0 auto;
  max-width: 1280px;
`;

const SearchInputContainer = styled(FlexJustifyContentFlexEndBox)`
  margin: ${({ theme }) => theme.spacing(2)} 0;
`;

const Table = styled('table')`
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  text-indent: 0;
`;
const Thead = styled('thead')``;
const Tbody = styled('tbody')`
  & tr:hover {
    background-color: ${({ theme }) => theme.color.black + '10'};
  }
`;

const TableRow = styled('tr')`
  border-bottom: 1px solid ${({ theme }) => theme.color.black + '10'};
  min-width: ${({ theme }) => theme.spacing(5)};
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

const TableCell = styled('td')`
  line-height: 1.25em;
  font-size: ${({ theme }) => theme.size.px14};
`;

const TableHeaderRow = styled(TableRow)`
  background-color: ${({ theme }) => theme.color.black + '05'};
`;
const TableHeaderCell = styled(TableCell)(({ theme }) => ({
  color: theme.color.gray20,
  padding: `${theme.spacing(1)} ${theme.spacing(0.5)}`,
  [`${theme.breakpoints.down('sm')}`]: {
    padding: `${theme.spacing(0.75)} ${theme.spacing(0.25)}`
  }
}));

const TableHeaderSortIcon = styled(FlexAlignItemsCenterBox)`
  font-size: ${({ theme }) => theme.size.px14};
`;

const TableCellInnerBox = styled('div')(({ theme }) => ({
  padding: `${theme.spacing(1)} ${theme.spacing(0.5)}`,
  [`${theme.breakpoints.down('sm')}`]: {
    padding: `${theme.spacing(0.75)} ${theme.spacing(0.25)}`
  }
}));

const ButtonContainer = styled(FlexBox)(({ theme }) => ({
  fontSize: theme.size.px16
}));

const MarketIconImage = styled('img')(({ theme }) => ({
  width: 16,
  height: 16,
  objectFit: 'contain',
  backgroundColor: theme.color.absolutlyWhite,
  borderRadius: '50%',
  [`${theme.breakpoints.down('sm')}`]: {
    width: 12,
    height: 12
  }
}));

const ExchangeImage = styled('img')`
  width: 1em;
  height: 1em;
  opacity: 0.65;
  object-fit: contain;
`;

const ChartIconBox = styled(CursorPointerBox)(({ theme }) => ({
  color: theme.color.black,
  opacity: 0.5
}));

const FavoriteIconBox = styled(CursorPointerBox)(({ theme }) => ({
  color: theme.color.yellowMain
}));

const IconCell = styled(TableCell)`
  font-size: ${({ theme }) => theme.size.px14};
  width: 28px;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    width: 12px;
  }
`;
const NameCell = styled(TableHeaderCell)`
  width: 'auto';
`;
const PriceCell = styled(TableHeaderCell)`
  width: 20%;
`;
const ChangeCell = styled(TableHeaderCell)`
  width: 10%;
`;
const PremiumCell = styled(TableHeaderCell)`
  width: 10%;
`;
const VolumeCell = styled(TableHeaderCell)`
  width: 10%;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    width: 'auto';
  }
`;

const DotContainer = styled(FlexAlignItemsCenterBox)(({ theme }) => ({
  fontSize: theme.size.px20
}));

export interface IMarketTableItem extends IUpbitSocketMessageTickerSimple {
  korean_name?: string;
  english_name?: string;
  binance_price?: string;
  binance_volume?: string;
  premium?: number;
}

interface MarketTableProps {
  upbitForex: IUpbitForex;
}

const MarketTable: React.FC<MarketTableProps> = memo(({ upbitForex }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { sortColumn, sortType, setSortColumn, setSortType } = useMarketTableSettingStore();
  const { connectedUpbit, connectedBinance, lastUpdatedAt } = useExchangeStore(
    ({ upbitSocket, binanceSocket, lastUpdatedAt }) => {
      let connectedUpbit = false;
      let connectedBinance = false;
      if (upbitSocket?.readyState === 1) {
        connectedUpbit = true;
      }
      if (binanceSocket?.readyState === 1) {
        connectedBinance = true;
      }
      return {
        connectedUpbit,
        connectedBinance,
        lastUpdatedAt
      };
    },
    shallow
  );
  const [searchValue, setSearchValue] = useState('');

  const handleClickThead = (columnName: keyof IMarketTableItem) => () => {
    if (columnName === sortColumn) {
      setSortType(sortType === 'ASC' ? 'DESC' : 'ASC');
      return;
    }
    setSortType('DESC');
    setSortColumn(columnName);
  };

  const handleChangeMarketSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    const { searchSymbols, sortSymbolList } = useExchangeStore.getState();
    searchSymbols(value);
    sortSymbolList(sortColumn, sortType);
  };

  const handleClickClearSearchInputButton = () => {
    setSearchValue('');

    const { searchSymbols, sortSymbolList } = useExchangeStore.getState();
    searchSymbols('');
    sortSymbolList(sortColumn, sortType);
  };

  const handleClickConnectSocket = (prop: 'upbit' | 'binance') => () => {
    switch (prop) {
      case 'upbit': {
        const { connectUpbitSocket, upbitMarkets } = useExchangeStore.getState();
        if (!connectedUpbit) {
          enqueueSnackbar('업비트 서버에 다시 연결을 시도합니다.', {
            variant: 'success'
          });
          useExchangeStore.setState({ upbitSocket: undefined });
          connectUpbitSocket({
            upbitMarkets: upbitMarkets
          });
        }
        break;
      }
      case 'binance': {
        const { connectBinanceSocket, upbitMarkets } = useExchangeStore.getState();
        if (!connectedBinance) {
          enqueueSnackbar('바이낸스 서버에 다시 연결을 시도합니다.', {
            variant: 'success'
          });
          useExchangeStore.setState({ binanceSocket: undefined });
          const markets = upbitMarkets.map(
            (m) => m.market.replace(krwRegex, '').toLowerCase() + 'usdt@ticker'
          );
          connectBinanceSocket({
            binanceMarkets: markets
          });
        }

        break;
      }
    }
  };

  return (
    <TableContainer>
      <noscript>
        <TextAlignCenterBox>
          <BackgroundRedBox sx={{ mt: 2, mb: 0 }}>
            <p>
              현재 사용중인 브라우저에서 자바스크립트가 비활성화 되어있습니다. 자바스크립트를
              활성화하고 새로고침 해주세요.
              <br />
              <a
                href="https://support.google.com/adsense/answer/12654?hl=ko"
                style={{
                  textDecoration: 'underline',
                  color: 'lightyellow'
                }}
                target="_blank"
                rel="noreferrer"
              >
                활성화 방법 보기
              </a>
            </p>
            <p>
              마지막 시세 업데이트: {timeForToday(lastUpdatedAt)}
              <br />({dateAndTime.format(lastUpdatedAt, 'YYYY-MM-DD HH:mm:ss')})
            </p>
          </BackgroundRedBox>
        </TextAlignCenterBox>
      </noscript>
      <FlexSpaceBetweenCenterBox>
        <FlexNoWrapBox>
          <Tooltip title={connectedUpbit ? '연결 됨' : '재연결'} arrow>
            <FlexAlignItemsCenterBox
              onClick={handleClickConnectSocket('upbit')}
              sx={connectedBinance ? undefined : { cursor: 'pointer' }}
            >
              <Typography component="span">업비트</Typography>
              <DotContainer
                sx={{ color: connectedUpbit ? theme.color.greenMain : theme.color.redMain }}
              >
                <GoPrimitiveDot />
              </DotContainer>
            </FlexAlignItemsCenterBox>
          </Tooltip>
          <Box mx={0.5} />
          <Tooltip title={connectedBinance ? '연결 됨' : '재연결'} arrow>
            <FlexAlignItemsCenterBox
              onClick={handleClickConnectSocket('binance')}
              sx={connectedBinance ? undefined : { cursor: 'pointer' }}
            >
              <Typography component="span">바이낸스</Typography>
              <DotContainer
                sx={{ color: connectedBinance ? theme.color.greenMain : theme.color.redMain }}
              >
                <GoPrimitiveDot />
              </DotContainer>
            </FlexAlignItemsCenterBox>
          </Tooltip>
        </FlexNoWrapBox>

        <SearchInputContainer>
          <FormControl sx={{ width: 170 }} variant="standard">
            <OutlinedInput
              placeholder="BTC, 비트, Bitcoin"
              value={searchValue}
              onChange={handleChangeMarketSearchInput}
              endAdornment={
                searchValue && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickClearSearchInputButton}
                      sx={{ color: theme.color.gray70 }}
                    >
                      <RiCloseCircleLine />
                    </IconButton>
                  </InputAdornment>
                )
              }
              sx={{
                pr: 0
              }}
            />
          </FormControl>
        </SearchInputContainer>
      </FlexSpaceBetweenCenterBox>
      <Table cellSpacing="0" cellPadding="0">
        <Thead>
          <TableHeaderRow>
            <IconCell>
              <TableCellInnerBox></TableCellInnerBox>
            </IconCell>
            <NameCell>
              <FlexBox>
                <Tooltip
                  arrow
                  placement="top"
                  title={
                    <Box>
                      <Typography>거래소로 이동</Typography>
                      <Typography>차트 변경</Typography>
                    </Box>
                  }
                >
                  <FlexCursorPointerBox onClick={handleClickThead('korean_name')}>
                    <Typography component="span">이름</Typography>
                    <TableHeaderSortIcon>
                      {sortColumn === 'korean_name' ? (
                        sortType === 'ASC' ? (
                          <BiDownArrowAlt />
                        ) : (
                          <BiUpArrowAlt />
                        )
                      ) : null}
                    </TableHeaderSortIcon>
                  </FlexCursorPointerBox>
                </Tooltip>
              </FlexBox>
            </NameCell>
            <PriceCell>
              <FlexJustifyContentFlexEndBox>
                <Tooltip
                  arrow
                  placement="top"
                  title={
                    <Box>
                      <Typography>업비트 현재가</Typography>
                      <Typography>바이낸스 현재가</Typography>
                    </Box>
                  }
                >
                  <FlexCursorPointerBox onClick={handleClickThead('tp')}>
                    <Typography component="span">현재가</Typography>
                    <TableHeaderSortIcon>
                      {sortColumn === 'tp' ? (
                        sortType === 'ASC' ? (
                          <BiDownArrowAlt />
                        ) : (
                          <BiUpArrowAlt />
                        )
                      ) : null}
                    </TableHeaderSortIcon>
                  </FlexCursorPointerBox>
                </Tooltip>
              </FlexJustifyContentFlexEndBox>
            </PriceCell>
            <ChangeCell>
              <FlexJustifyContentFlexEndBox>
                <Tooltip
                  arrow
                  placement="top"
                  title={
                    <Box>
                      <Typography>일일 변동 퍼센트</Typography>
                      <Typography>일일 변동 가격</Typography>
                    </Box>
                  }
                >
                  <FlexCursorPointerBox onClick={handleClickThead('scr')}>
                    <Typography component="span">변동</Typography>
                    <TableHeaderSortIcon>
                      {sortColumn === 'scr' ? (
                        sortType === 'ASC' ? (
                          <BiDownArrowAlt />
                        ) : (
                          <BiUpArrowAlt />
                        )
                      ) : null}
                    </TableHeaderSortIcon>
                  </FlexCursorPointerBox>
                </Tooltip>
              </FlexJustifyContentFlexEndBox>
            </ChangeCell>
            <PremiumCell>
              <FlexJustifyContentFlexEndBox>
                <Tooltip
                  arrow
                  placement="top"
                  title={
                    <Box>
                      <Typography>원화 프리미엄</Typography>
                      <Typography>업비트-바이낸스 가격 차이</Typography>
                    </Box>
                  }
                >
                  <FlexCursorPointerBox onClick={handleClickThead('premium')}>
                    <Typography component="span">김프</Typography>
                    <TableHeaderSortIcon>
                      {sortColumn === 'premium' ? (
                        sortType === 'ASC' ? (
                          <BiDownArrowAlt />
                        ) : (
                          <BiUpArrowAlt />
                        )
                      ) : null}
                    </TableHeaderSortIcon>
                  </FlexCursorPointerBox>
                </Tooltip>
              </FlexJustifyContentFlexEndBox>
            </PremiumCell>
            <VolumeCell>
              <FlexJustifyContentFlexEndBox>
                <Tooltip
                  arrow
                  placement="top"
                  title={
                    <Box>
                      <Typography>업비트 거래량</Typography>
                      <Typography>바이낸스 거래량</Typography>
                    </Box>
                  }
                >
                  <FlexCursorPointerBox onClick={handleClickThead('atp24h')}>
                    <Typography component="span">거래량</Typography>
                    <TableHeaderSortIcon>
                      {sortColumn === 'atp24h' ? (
                        sortType === 'ASC' ? (
                          <BiDownArrowAlt />
                        ) : (
                          <BiUpArrowAlt />
                        )
                      ) : null}
                    </TableHeaderSortIcon>
                  </FlexCursorPointerBox>
                </Tooltip>
              </FlexJustifyContentFlexEndBox>
            </VolumeCell>
          </TableHeaderRow>
        </Thead>
        <TableBody upbitForex={upbitForex} sortColumn={sortColumn} sortType={sortType} />
      </Table>
    </TableContainer>
  );
}, isEqual);

const TableBody = React.memo<{
  upbitForex: IUpbitForex;
  sortColumn: keyof IMarketTableItem;
  sortType: 'ASC' | 'DESC';
  // upbitMarketSnapshot?: Record<string, IMarketTableItem>;
  // binanceMarketSnapshot?: Record<string, IBinanceSocketMessageTicker>;
}>(({ upbitForex, sortColumn, sortType }) => {
  const { hydrated, favoriteSymbols } = useMarketTableSettingStore(
    ({ hydrated, favoriteSymbols }) => ({ hydrated, favoriteSymbols }),
    shallow
  );
  const { searchedSymbols, sortedUpbitMarketSymbolList } = useExchangeStore(
    ({ searchedSymbols, sortedUpbitMarketSymbolList }) => ({
      searchedSymbols,
      sortedUpbitMarketSymbolList
    }),
    shallow
  );
  const symbols = hydrated ? searchedSymbols : sortedUpbitMarketSymbolList;

  useEffect(() => {
    const { hydrated, setHydrated } = useMarketTableSettingStore.getState();

    if (!hydrated) setHydrated();
  });

  useEffect(() => {
    useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
    const interval = setInterval(() => {
      useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
      // setNum((prev) => 1 - prev);
    }, 3000);
    return () => clearInterval(interval);
  }, [sortColumn, sortType]);

  return (
    <Tbody>
      {symbols.map((krwSymbol, index) => {
        const favorite = hydrated ? Boolean(favoriteSymbols[krwSymbol]) : false;

        return (
          <TableItem
            key={krwSymbol}
            // upbitMarket={upbitMarket}
            krwSymbol={krwSymbol}
            upbitForex={upbitForex}
            favorite={favorite}
          />
        );
      })}
    </Tbody>
  );
}, isEqual);

TableBody.displayName = 'TableBody';

const TableItem = React.memo<{
  krwSymbol: string;
  // upbitMarket: IMarketTableItem;
  upbitForex: IUpbitForex;
  favorite: boolean;
}>(({ krwSymbol, upbitForex, favorite }) => {
  const theme = useTheme();
  const upbitMarket = useExchangeStore((state) => state.upbitMarketDatas[krwSymbol], shallow);
  const marketSymbol = upbitMarket.cd.replace(marketRegex, '');

  // const upbitBtcMarket = useExchangeStore(
  //   (state) => state.upbitMarketDatas['BTC-' + marketSymbol],
  //   shallow
  // );
  // const upbitBtcPrice = useExchangeStore.getState().upbitMarketDatas['KRW-BTC'];

  const { selectedMarketSymbol, selectedExchange } = useTradingViewSettingStore();

  const handleClickMarketIcon = useCallback(
    (symbol: string, exchange: 'BINANCE' | 'UPBIT') => () => {
      const { setSelectedMarketSymbol, setSelectedExchange } =
        useTradingViewSettingStore.getState();
      setSelectedMarketSymbol(symbol);
      setSelectedExchange(exchange);
      window.scrollTo(0, 0);
    },
    []
  );
  const handleClickStarIcon = useCallback(
    (symbol: string) => () => {
      if (!favorite) {
        useMarketTableSettingStore.getState().addFavoriteSymbol(symbol);
      } else {
        useMarketTableSettingStore.getState().removeFavoriteSymbol(symbol);
      }
      const { sortColumn, sortType } = useMarketTableSettingStore.getState();
      useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
    },
    [favorite]
  );

  const upbitChangeRate = upbitMarket.scr * 100;

  let title = 'SOOROS';
  if (selectedMarketSymbol === marketSymbol) {
    // const titleSymbol = `KRW-${selectedMarketSymbol || 'BTC'}`;

    switch (selectedExchange) {
      case 'BINANCE': {
        title =
          (upbitMarket.binance_price
            ? `${selectedMarketSymbol} ${Number(upbitMarket.binance_price).toLocaleString()}$ | `
            : '') + title;
        break;
      }
      case 'UPBIT': {
        title = `${selectedMarketSymbol} ${upbitMarket.tp.toLocaleString()}₩ | ` + title;
        break;
      }
    }
  }
  // const priceIntegerLength = String(upbitMarket.tp).replace(
  //   /\.[0-9]+$/,
  //   ""
  // ).length;

  const priceDecimalLength = String(upbitMarket.tp).replace(/^[0-9]+\.?/, '').length;

  return (
    <TableRow>
      {selectedMarketSymbol === marketSymbol && (
        <NextSeo
          // title={bitcoinPremium ? `${bitcoinPremium?.toFixed(2)}%` : undefined}
          title={title}
        />
      )}
      <TableCell>
        <TableCellInnerBox>
          <TextAlignCenterBox>
            <MarketIconImage
              src={`/asset/upbit/logos/${marketSymbol}.png`}
              alt={`${upbitMarket.cd}-icon`}
            />
          </TextAlignCenterBox>
          <FlexJustifyContentCenterBox>
            <ButtonContainer>
              {favorite ? (
                <FavoriteIconBox onClick={handleClickStarIcon(upbitMarket.cd)}>
                  <AiFillStar />
                </FavoriteIconBox>
              ) : (
                <ChartIconBox
                  onClick={handleClickStarIcon(upbitMarket.cd)}
                  sx={{
                    color: favorite ? theme.color.yellowMain : undefined
                  }}
                >
                  <AiFillStar />
                </ChartIconBox>
              )}
            </ButtonContainer>
          </FlexJustifyContentCenterBox>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          {/* <FlexBox>
            <HoverUnderlineBox>
              <Link href={'/trade/' + upbitMarket.cd}>
                <a> */}
          <FlexAlignItemsCenterBox>
            {/* <ChartIconBox fontSize={theme.size.px16} mr={0.5}>
                      <RiExchangeLine />
                    </ChartIconBox> */}
            <Typography>{upbitMarket.korean_name}</Typography>
          </FlexAlignItemsCenterBox>
          {/* </a>
              </Link>
            </HoverUnderlineBox>
          </FlexBox> */}
          <ButtonContainer>
            <a
              href={clientApiUrls.upbit.marketHref + upbitMarket.cd}
              target="_blank"
              rel="noreferrer"
            >
              <ExchangeImage src="/icons/upbit.png" alt="upbit favicon"></ExchangeImage>
            </a>
            <ChartIconBox onClick={handleClickMarketIcon(marketSymbol, 'UPBIT')}>
              <AiOutlineAreaChart />
            </ChartIconBox>
            &nbsp;
            {upbitMarket.binance_price && (
              <>
                <a
                  href={`${clientApiUrls.binance.marketHref}/${marketSymbol}_USDT`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExchangeImage src="/icons/binance.ico" alt="upbit favicon"></ExchangeImage>
                </a>
                <ChartIconBox onClick={handleClickMarketIcon(marketSymbol, 'BINANCE')}>
                  <AiOutlineAreaChart />
                </ChartIconBox>
              </>
            )}
          </ButtonContainer>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          <NoWrapBox>
            <MonoFontBox>
              <TextAlignRightBox>
                <AskBidTypography state={upbitMarket.scp}>
                  {upbitMarket.tp.toLocaleString()}
                  {/* <br />
                  {upbitBtcMarket && upbitBtcPrice
                    ? Number(
                        (upbitBtcMarket.tp * upbitBtcPrice.tp).toFixed(priceDecimalLength)
                      ).toLocaleString()
                    : ''} */}
                </AskBidTypography>
                <AskBidTypography state={upbitMarket.scp} opacity={0.7}>
                  {upbitMarket.binance_price &&
                    Number(
                      (Number(upbitMarket.binance_price) * upbitForex.basePrice).toFixed(
                        priceDecimalLength
                      )
                    ).toLocaleString()}
                </AskBidTypography>
              </TextAlignRightBox>
            </MonoFontBox>
          </NoWrapBox>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          <NoWrapBox>
            <MonoFontBox>
              <TextAlignRightBox>
                <AskBidTypography state={upbitMarket.scp}>
                  {upbitChangeRate.toFixed(2)}%
                </AskBidTypography>
                <AskBidTypography state={upbitMarket.scp} opacity={0.7}>
                  {upbitMarket.scp.toLocaleString()}
                  {/* {binanceChangeRate && binanceChangeRate.toFixed(2) + '%'} */}
                </AskBidTypography>
              </TextAlignRightBox>
            </MonoFontBox>
          </NoWrapBox>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          <NoWrapBox>
            <MonoFontBox>
              {typeof upbitMarket.premium === 'number' && (
                <TextAlignRightBox>
                  <AskBidTypography state={upbitMarket.premium}>
                    {upbitMarket.premium.toFixed(2).padStart(2, '0')}%
                  </AskBidTypography>
                  <AskBidTypography state={upbitMarket.premium} opacity={0.7}>
                    {upbitMarket.binance_price &&
                      Number(
                        (
                          upbitMarket.tp -
                          Number(upbitMarket.binance_price) * upbitForex.basePrice
                        ).toFixed(priceDecimalLength)
                      ).toLocaleString()}
                  </AskBidTypography>
                </TextAlignRightBox>
              )}
            </MonoFontBox>
          </NoWrapBox>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          <MonoFontBox>
            <NoWrapBox>
              <TextAlignRightBox>
                <Typography color={theme.color.gray30}>
                  {koPriceLabelFormat(upbitMarket.atp24h)}
                </Typography>
                <Typography
                  sx={{
                    color: theme.color.gray70
                  }}
                >
                  {upbitMarket.binance_price &&
                    koPriceLabelFormat(Number(upbitMarket.binance_volume) * upbitForex.basePrice)}
                </Typography>
              </TextAlignRightBox>
            </NoWrapBox>
          </MonoFontBox>
        </TableCellInnerBox>
      </TableCell>
    </TableRow>
  );
}, isEqual);

TableItem.displayName = 'TableItem';
MarketTable.displayName = 'MarketTable';

export default MarketTable;
