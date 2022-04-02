import React, { memo, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import isEqual from 'react-fast-compare';
import { BiUpArrowAlt, BiDownArrowAlt } from 'react-icons/bi';
import { IUpbitForex, IUpbitMarket, IUpbitSocketMessageTickerSimple } from 'src/types/upbit';
import {
  CursorPointerBox,
  FlexAlignItemsCenterBox,
  FlexBox,
  FlexCursorPointerBox,
  FlexJustifyContentFlexEndBox,
  MonoFontBox,
  NoWrapBox,
  TextAlignRightBox
} from '../modules/Box';
import { koPriceLabelFormat } from 'src/utils/utils';
import { IBinanceSocketMessageTicker } from 'src/types/binance';
import { NextSeo } from 'next-seo';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Tooltip, Typography } from '@mui/material';
import { AskBidTypography, MonoFontTypography } from '../modules/Typography';
import { clientApiUrls } from 'src/utils/clientApiUrls';
import { useSiteSettingStore } from 'src/store/siteSetting';
import { AiOutlineAreaChart } from 'react-icons/ai';
import { useExchangeStore } from 'src/store/exchangeSockets';

const TableContainer = styled('div')`
  margin: 0 auto;
  max-width: 1280px;
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

const MarketIconImage = styled('img')(({ theme }) => ({
  width: 20,
  height: 20,
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
  opacity: 0.4
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

const krwRegex = /^krw-/i;
const usdtRegex = /^usdt-/i;
const btcRegex = /^btc-/i;

export interface IMarketTableItem extends IUpbitSocketMessageTickerSimple {
  korean_name: string;
  english_name: string;
  binance_name?: string;
  premium?: number;
}

interface MarketTableProps {
  upbitForex: IUpbitForex;
  upbitKrwList: Array<IUpbitMarket>;
}
export const MarketTableContainer: React.FC<MarketTableProps> = memo(
  ({ upbitForex, upbitKrwList }) => {
    const connectUpbitSocketRef = useRef(useExchangeStore((state) => state.connectUpbitSocket));
    const connectBinanceSocketRef = useRef(useExchangeStore((state) => state.connectBinanceSocket));

    useEffect(() => {
      connectUpbitSocketRef.current({
        upbitMarkets: upbitKrwList
      });
    }, [upbitKrwList]);

    // useEffect(() => {
    //   const connectCheck = setInterval(() => {
    //     if (!upbitSocket || upbitSocket.readyState !== 1) {
    //       upbitSocket?.close();
    //       connectUpbitSocket({
    //         upbitMarkets: upbitKrwList,
    //         stateUpdateDelay,
    //         upbitMarketSnapshot: upbitMarketSnapshot
    //       });
    //     }
    //   }, 5000);

    //   return () => clearInterval(connectCheck);
    // }, [connectUpbitSocket, stateUpdateDelay, upbitKrwList, upbitMarketSnapshot, upbitSocket]);

    useEffect(() => {
      connectBinanceSocketRef.current({
        binanceMarkets: upbitKrwList.map(
          (m) => m.market.replace(/^krw-/i, '').toLowerCase() + 'usdt@ticker'
        )
      });
    }, [upbitKrwList]);

    // useEffect(() => {
    //   const connectCheck = setInterval(() => {
    //     if (!binanceSocket || binanceSocket.readyState !== 1) {
    //       binanceSocket?.close();
    //       connectBinanceSocket({
    //         binanceMarkets: upbitKrwList.map(
    //           (m) => m.market.replace(/^krw-/i, '').toLowerCase() + 'usdt@ticker'
    //         ),
    //         stateUpdateDelay
    //       });
    //     }
    //   }, 5000);

    //   return () => clearInterval(connectCheck);
    // }, [binanceSocket, connectBinanceSocket, stateUpdateDelay, upbitKrwList]);

    return <MarketTable upbitForex={upbitForex} upbitKrwList={upbitKrwList} />;
  },
  (prev, next) => prev.upbitForex === next.upbitForex
);

const MarketTable: React.FC<MarketTableProps> = memo(({ upbitForex }) => {
  const [sortColumnName, setSortColumnName] = React.useState<keyof IMarketTableItem>('atp24h');
  const [sortType, setSortType] = React.useState<'asc' | 'desc'>('desc');

  const handleClickThead = (columnName: keyof IMarketTableItem) => () => {
    if (columnName === sortColumnName) {
      setSortType((prevState) => (prevState === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortType('desc');
    setSortColumnName(columnName);
  };

  return (
    <TableContainer>
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
                      {sortColumnName === 'korean_name' ? (
                        sortType === 'asc' ? (
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
                      {sortColumnName === 'tp' ? (
                        sortType === 'asc' ? (
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
                      {sortColumnName === 'scr' ? (
                        sortType === 'asc' ? (
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
                      {sortColumnName === 'premium' ? (
                        sortType === 'asc' ? (
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
                      {sortColumnName === 'atp24h' ? (
                        sortType === 'asc' ? (
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
        <TableBody upbitForex={upbitForex} sortColumnName={sortColumnName} sortType={sortType} />
      </Table>
    </TableContainer>
  );
}, isEqual);

const TableBody = React.memo<{
  upbitForex: IUpbitForex;
  sortColumnName: keyof IMarketTableItem;
  sortType: 'asc' | 'desc';
  // upbitMarketSnapshot?: Record<string, IMarketTableItem>;
  // binanceMarketSnapshot?: Record<string, IBinanceSocketMessageTicker>;
}>(({ upbitForex, sortColumnName, sortType }) => {
  const columnSort = React.useCallback(
    (aItem: IMarketTableItem, bItem: IMarketTableItem) => {
      const a = aItem[sortColumnName];
      const b = bItem[sortColumnName];
      if (a === undefined) return 1;
      if (b === undefined) return -1;
      if (typeof a === 'number' && typeof b === 'number') {
        if (sortType === 'asc') {
          return a - b;
        }
        return b - a;
      } else if (typeof a === 'string' && typeof b === 'string') {
        const aValue = a.toUpperCase();
        const bValue = b.toUpperCase();
        if (sortType === 'asc') {
          if (aValue < bValue) {
            return 1;
          }
          if (aValue > bValue) {
            return -1;
          }
          return 0;
        }
        if (aValue < bValue) {
          return -1;
        }
        if (aValue > bValue) {
          return 1;
        }
        return 0;
      }
      return 0;
    },
    [sortColumnName, sortType]
  );

  const list = Object.values(useExchangeStore.getState().upbitMarketDatas).sort(columnSort);

  // let bitcoinPremium: number | undefined;
  // if (binanceMarketDatas["BTCUSDT"] && upbitRealtimeMarket["KRW-BTC"]) {
  //   const binancePrice = binanceMarketDatas["BTCUSDT"]?.data?.p
  //     ? Number(binanceMarketDatas["BTCUSDT"]?.data?.p) * upbitForex.basePrice
  //     : undefined;
  //   bitcoinPremium =
  //     binancePrice && upbitRealtimeMarket["KRW-BTC"]
  //       ? (1 - binancePrice / upbitRealtimeMarket["KRW-BTC"]?.tp) * 100
  //       : undefined;
  // }
  const upbitMarketDatasRef = useRef(useExchangeStore.getState().upbitMarketDatas);
  const [num, setNum] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNum((prev) => 1 - prev);
    }, 300);
    // useExchangeStore.subscribe((state) => {
    //   (upbitMarketDatasRef.current = state.upbitMarketDatas),
    //     (binanceMarketDatasRef.current = state.binanceMarketDatas);
    // });
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Tbody>
        {list.map((market) => (
          <TableItem
            key={`market-table-${market.cd}`}
            upbitMarket={market}
            upbitForex={upbitForex}
            // onClickMarketIcon={handleClickMarketIcon}
          />
        ))}
      </Tbody>
    </>
  );
}, isEqual);

TableBody.displayName = 'TableBody';

const TableItem = React.memo<{
  upbitMarket: IMarketTableItem;
  upbitForex: IUpbitForex;
  // onClickMarketIcon: (prop: string) => (event: React.MouseEvent<HTMLDivElement>) => void;
}>(
  ({
    upbitMarket,
    upbitForex
    // , onClickMarketIcon
  }) => {
    const theme = useTheme();
    const upbitChangeRate = upbitMarket.scr * 100;
    const marketSymbol = upbitMarket.cd.replace(krwRegex, '');
    const { selectedMarketSymbol, selectedExchange, setSelectedMarketSymbol, setSelectedExchange } =
      useSiteSettingStore();

    const binanceMarketName = upbitMarket.cd.replace(krwRegex, '') + 'USDT';
    const binanceMarket: undefined | IBinanceSocketMessageTicker =
      useExchangeStore.getState().binanceMarketDatas[binanceMarketName];
    const binancePrice = binanceMarket
      ? Number(binanceMarket.data.c) * upbitForex.basePrice
      : undefined;
    const krwPremium = binancePrice ? (1 - binancePrice / upbitMarket.tp) * 100 : undefined;

    const handleClickMarketIcon = (symbol: string, exchange: 'BINANCE' | 'UPBIT') => () => {
      setSelectedMarketSymbol(symbol);
      setSelectedExchange(exchange);
      window.scrollTo(0, 0);
    };

    let title = 'SOOROS';

    if (selectedMarketSymbol === marketSymbol) {
      // const titleSymbol = `KRW-${selectedMarketSymbol || 'BTC'}`;

      switch (selectedExchange) {
        case 'BINANCE': {
          title =
            (binanceMarket
              ? `${selectedMarketSymbol} ${Number(binanceMarket.data.c).toLocaleString()}$ | `
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
            <FlexAlignItemsCenterBox>
              <MarketIconImage
                src={`/asset/upbit/logos/${marketSymbol}.png`}
                alt={`${upbitMarket.cd}-icon`}
              />
            </FlexAlignItemsCenterBox>
          </TableCellInnerBox>
        </TableCell>
        <TableCell>
          <TableCellInnerBox>
            <Typography>{upbitMarket.korean_name}</Typography>
            <FlexBox>
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
              {binanceMarket && (
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
            </FlexBox>
          </TableCellInnerBox>
        </TableCell>
        <TableCell>
          <TableCellInnerBox>
            <NoWrapBox>
              <MonoFontBox>
                <TextAlignRightBox>
                  <AskBidTypography state={upbitMarket.scp}>
                    {upbitMarket.tp.toLocaleString()}
                  </AskBidTypography>
                  <AskBidTypography state={upbitMarket.scp} opacity={0.6}>
                    {binanceMarket &&
                      Number(
                        (Number(binanceMarket.data.c) * upbitForex.basePrice).toFixed(
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
                  <AskBidTypography state={upbitMarket.scp} opacity={0.6}>
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
                {typeof krwPremium === 'number' && (
                  <TextAlignRightBox>
                    <AskBidTypography state={krwPremium}>
                      {krwPremium.toFixed(2).padStart(2, '0')}%
                    </AskBidTypography>
                    <AskBidTypography state={krwPremium} opacity={0.6}>
                      {binanceMarket &&
                        Number(
                          (
                            upbitMarket.tp -
                            Number(binanceMarket.data.c) * upbitForex.basePrice
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
                    {binanceMarket &&
                      koPriceLabelFormat(Number(binanceMarket.data.q) * upbitForex.basePrice)}
                  </Typography>
                </TextAlignRightBox>
              </NoWrapBox>
            </MonoFontBox>
          </TableCellInnerBox>
        </TableCell>
      </TableRow>
    );
  },
  isEqual
);

TableItem.displayName = 'TableItem';
MarketTable.displayName = 'MarketTable';
MarketTableContainer.displayName = 'MarketTableContainer';

export default MarketTableContainer;
