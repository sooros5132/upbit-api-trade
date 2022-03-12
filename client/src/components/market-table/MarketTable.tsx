import React, { useContext } from "react";
import styled from "styled-components";
import _ from "lodash";
import isEqual from "react-fast-compare";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import UpbitWebSocket, { UpbitWebSocketContext } from "../websocket/Upbit";
import {
  IUpbitForex,
  IUpbitMarket,
  IUpbitSocketMessageTickerSimple,
} from "src/types/upbit";
import {
  ColorBox,
  FlexAlignItemsCenterBox,
  FlexBox,
  FlexColumnBox,
  FlexJustifyContentFlexEndBox,
  MonoFontBox,
  TextAlignRightBox,
} from "../modules/Box";
import { Paragraph } from "../modules/Typography";
import { koPriceLabelFormat } from "src/utils/utils";
import BinanceWebSocket, {
  BinanceWebSocketContext,
} from "../websocket/Binance";
import { IBinanceSocketMessageTicker } from "src/types/binance";
import { NextSeo } from "next-seo";

const TableContainer = styled.div`
  margin: 0 auto;
  max-width: 1280px;
`;
const Table = styled.table`
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  text-indent: 0;
`;
const Thead = styled.thead``;
const Tbody = styled.tbody`
  & tr:hover {
    background-color: ${({ theme }) => theme.palette.white + "33"};
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.palette.white + "10"};
  min-width: ${({ theme }) => theme.spacing(5)};
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

const TableCell = styled.td`
  line-height: 1.25em;
  font-size: ${({ theme }) => theme.size.px14};
`;

const TableHeaderRow = styled(TableRow)`
  background-color: ${({ theme }) => theme.palette.white + "05"};
`;
const TableHeaderCell = styled(TableCell)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(0.5)}`};
`;

const TableHeaderSortIcon = styled(FlexAlignItemsCenterBox)`
  font-size: ${({ theme }) => theme.size.px14};
`;

const TableCellInnerBox = styled.div`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(0.5)}`};
`;

const MarketIconImage = styled.img`
  width: ${({ theme }) => theme.size.px14};
  height: 1em;
  object-fit: contain;
`;

const ExchangeImage = styled.img`
  width: 1em;
  height: 1em;
  opacity: 0.75;
  object-fit: contain;
`;

const Col = styled.col`
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

const IconCol = styled(Col)`
  font-size: ${({ theme }) => theme.size.px14};
  width: 1em;
`;
const NameCol = styled(Col)`
  width: auto;
`;
const PremiumCol = styled(Col)`
  width: 10%;
`;
const PriceCol = styled(Col)`
  width: 15%;
`;
const ChangeCol = styled(Col)`
  width: 10%;
`;
const VolumeCol = styled(Col)`
  width: 10%;
`;

const krwRegex = /^krw-/i;
const usdtRegex = /^usdt-/i;
const btcRegex = /^btc-/i;

export interface IMarketTableItem extends IUpbitSocketMessageTickerSimple {
  korean_name: string;
  english_name: string;
  binance_name: string;
  premium: number;
}

interface MarketTableProps {
  upbitForex: IUpbitForex;
  upbitKrwList: Array<IUpbitMarket>;
}

const MarketTable: React.FC<MarketTableProps> = ({
  upbitForex,
  upbitKrwList,
}) => {
  const [sortColumnName, setSortColumnName] =
    React.useState<keyof IMarketTableItem>("atp24h");
  const [sortType, setSortType] = React.useState<"asc" | "desc">("desc");

  const handleClickThead = (columnName: keyof IMarketTableItem) => () => {
    if (columnName === sortColumnName) {
      setSortType((prevState) => (prevState === "asc" ? "desc" : "asc"));
      return;
    }
    setSortType("asc");
    setSortColumnName(columnName);
  };

  return (
    <UpbitWebSocket marketList={upbitKrwList}>
      <BinanceWebSocket marketList={upbitKrwList}>
        <TableContainer>
          {/* <Head
        title={`₿ ${
          upbitRealtimeMarket["KRW-BTC"]?.trade_price?.toLocaleString() || ""
        } | SOOROS`}
      /> */}
          <Table cellSpacing="0" cellPadding="0">
            <colgroup>
              <IconCol />
              <NameCol />
              <PremiumCol />
              <PriceCol />
              <ChangeCol />
              <VolumeCol />
            </colgroup>
            <Thead>
              <TableHeaderRow>
                <TableCell>
                  <TableCellInnerBox></TableCellInnerBox>
                </TableCell>
                <TableHeaderCell>
                  <FlexBox>
                    <Paragraph
                      cursor="pointer"
                      onClick={handleClickThead("korean_name")}
                    >
                      이름
                    </Paragraph>
                    <TableHeaderSortIcon>
                      {sortColumnName === "korean_name" ? (
                        sortType === "asc" ? (
                          <BiDownArrowAlt />
                        ) : (
                          <BiUpArrowAlt />
                        )
                      ) : null}
                    </TableHeaderSortIcon>
                  </FlexBox>
                </TableHeaderCell>
                <TableHeaderCell>
                  <FlexJustifyContentFlexEndBox>
                    <FlexBox onClick={handleClickThead("premium")}>
                      <Paragraph cursor="pointer">시세차이</Paragraph>
                      <TableHeaderSortIcon>
                        {sortColumnName === "premium" ? (
                          sortType === "asc" ? (
                            <BiDownArrowAlt />
                          ) : (
                            <BiUpArrowAlt />
                          )
                        ) : null}
                      </TableHeaderSortIcon>
                    </FlexBox>
                  </FlexJustifyContentFlexEndBox>
                </TableHeaderCell>
                <TableHeaderCell>
                  <FlexJustifyContentFlexEndBox>
                    <FlexBox onClick={handleClickThead("tp")}>
                      <Paragraph cursor="pointer">현재가</Paragraph>
                      <TableHeaderSortIcon>
                        {sortColumnName === "tp" ? (
                          sortType === "asc" ? (
                            <BiDownArrowAlt />
                          ) : (
                            <BiUpArrowAlt />
                          )
                        ) : null}
                      </TableHeaderSortIcon>
                    </FlexBox>
                  </FlexJustifyContentFlexEndBox>
                </TableHeaderCell>
                <TableHeaderCell>
                  <FlexJustifyContentFlexEndBox>
                    <FlexBox onClick={handleClickThead("scr")}>
                      <Paragraph cursor="pointer">전일 대비</Paragraph>
                      <TableHeaderSortIcon>
                        {sortColumnName === "scr" ? (
                          sortType === "asc" ? (
                            <BiDownArrowAlt />
                          ) : (
                            <BiUpArrowAlt />
                          )
                        ) : null}
                      </TableHeaderSortIcon>
                    </FlexBox>
                  </FlexJustifyContentFlexEndBox>
                </TableHeaderCell>
                <TableHeaderCell>
                  <FlexJustifyContentFlexEndBox>
                    <FlexBox onClick={handleClickThead("atp24h")}>
                      <Paragraph cursor="pointer">거래대금</Paragraph>
                      <TableHeaderSortIcon>
                        {sortColumnName === "atp24h" ? (
                          sortType === "asc" ? (
                            <BiDownArrowAlt />
                          ) : (
                            <BiUpArrowAlt />
                          )
                        ) : null}
                      </TableHeaderSortIcon>
                    </FlexBox>
                  </FlexJustifyContentFlexEndBox>
                </TableHeaderCell>
              </TableHeaderRow>
            </Thead>
            <TableBody
              upbitForex={upbitForex}
              sortColumnName={sortColumnName}
              sortType={sortType}
            />
          </Table>
        </TableContainer>
      </BinanceWebSocket>
    </UpbitWebSocket>
  );
};

const TableBody = React.memo<{
  upbitForex: IUpbitForex;
  sortColumnName: keyof IMarketTableItem;
  sortType: "asc" | "desc";
}>(({ upbitForex, sortColumnName, sortType }) => {
  const upbitRealtimeMarket = useContext(UpbitWebSocketContext);
  const binanceRealtimeMarket = useContext(BinanceWebSocketContext);

  const columnSort = React.useCallback(
    (aItem: IMarketTableItem, bItem: IMarketTableItem) => {
      const a = aItem[sortColumnName];
      const b = bItem[sortColumnName];
      if (typeof a === "number" && typeof b === "number") {
        if (sortType === "asc") {
          return a - b;
        }
        return b - a;
      } else if (typeof a === "string" && typeof b === "string") {
        const aValue = a.toUpperCase();
        const bValue = b.toUpperCase();
        if (sortType === "asc") {
          if (aValue < bValue) {
            return 1;
          }
          if (aValue > bValue) {
            return -1;
          }
        } else {
          if (aValue < bValue) {
            return -1;
          }
          if (aValue > bValue) {
            return 1;
          }
        }
        return 0;
      }
      return 0;
    },
    [sortColumnName, sortType]
  );

  const list = Object.values(upbitRealtimeMarket)
    .map((upbitMarket) => {
      const binanceMarketName = upbitMarket.cd.replace(krwRegex, "") + "USDT";
      const binanceMarket = binanceRealtimeMarket[binanceMarketName];
      const binancePrice = binanceRealtimeMarket[binanceMarketName]
        ? Number(binanceMarket.data.p) * upbitForex.basePrice
        : undefined;
      const premium = binancePrice
        ? (1 - binancePrice / upbitMarket.tp) * 100
        : 0;

      return {
        ...upbitMarket,
        binance_name: binanceMarketName,
        premium,
      };
    })
    .sort(columnSort);

  // let bitcoinPremium: number | undefined;
  // if (binanceRealtimeMarket["BTCUSDT"] && upbitRealtimeMarket["KRW-BTC"]) {
  //   const binancePrice = binanceRealtimeMarket["BTCUSDT"]?.data?.p
  //     ? Number(binanceRealtimeMarket["BTCUSDT"]?.data?.p) * upbitForex.basePrice
  //     : undefined;
  //   bitcoinPremium =
  //     binancePrice && upbitRealtimeMarket["KRW-BTC"]
  //       ? (1 - binancePrice / upbitRealtimeMarket["KRW-BTC"]?.tp) * 100
  //       : undefined;
  // }
  return (
    <>
      <NextSeo
        // title={bitcoinPremium ? `${bitcoinPremium?.toFixed(2)}%` : undefined}
        title={`${
          upbitRealtimeMarket["KRW-BTC"]
            ? "₿ " + (upbitRealtimeMarket["KRW-BTC"].cr * 100).toFixed(2) + "%"
            : ""
        } | SOOROS`}
      ></NextSeo>
      <Tbody>
        {list.map((market) => {
          return (
            <TableItem
              key={`market-table-${market.cd}`}
              upbitMarket={market}
              binanceMarket={binanceRealtimeMarket[market.binance_name]}
              upbitForex={upbitForex}
            />
          );
        })}
      </Tbody>
    </>
  );
}, isEqual);

TableBody.displayName = "TableBody";

const TableItem = React.memo<{
  upbitMarket: IMarketTableItem;
  upbitForex: IUpbitForex;
  binanceMarket?: IBinanceSocketMessageTicker;
}>(({ upbitMarket, binanceMarket, upbitForex }) => {
  const changeRate = upbitMarket.scr * 100;
  const changePrice = upbitMarket.tp - upbitMarket.op;
  const marketSymbol = upbitMarket.cd.replace(krwRegex, "");
  // const usdtName = marketSymbol + "USDT";
  // const priceIntegerLength = String(upbitMarket.tp).replace(
  //   /\.[0-9]+$/,
  //   ""
  // ).length;
  const priceDecimalLength = String(upbitMarket.tp).replace(
    /^[0-9]+\.?/,
    ""
  ).length;
  return (
    <TableRow>
      <TableCell>
        <TableCellInnerBox>
          <FlexAlignItemsCenterBox>
            <MarketIconImage
              src={`/asset/upbit/logos/${upbitMarket.cd.replace(
                krwRegex,
                ""
              )}.png`}
              alt={`${upbitMarket.cd}-icon`}
            />
          </FlexAlignItemsCenterBox>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          <Paragraph color="gray20">{upbitMarket.korean_name}</Paragraph>
          <FlexBox>
            <a
              href={`https://upbit.com/exchange?code=CRIX.UPBIT.${upbitMarket.cd}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExchangeImage
                src="/icons/upbit.png"
                alt="upbit favicon"
              ></ExchangeImage>
            </a>
            &nbsp;
            {binanceMarket ? (
              <a
                href={`https://www.binance.com/en/trade/${marketSymbol}_USDT`}
                target="_blank"
                rel="noreferrer"
              >
                <ExchangeImage
                  src="/icons/binance.ico"
                  alt="upbit favicon"
                ></ExchangeImage>
              </a>
            ) : null}
          </FlexBox>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          <MonoFontBox>
            {upbitMarket.premium ? (
              <TextAlignRightBox>
                <ColorBox
                  color={
                    upbitMarket.premium === 0
                      ? "textBlueGray"
                      : upbitMarket.premium > 0
                      ? "greenLight"
                      : "redLight"
                  }
                >
                  <Paragraph>
                    {upbitMarket.premium.toFixed(2).padStart(2, "0")}%
                  </Paragraph>
                  <Paragraph>
                    {binanceMarket
                      ? Number(
                          (
                            upbitMarket.tp -
                            Number(binanceMarket.data.p) * upbitForex.basePrice
                          ).toFixed(priceDecimalLength)
                        ).toLocaleString()
                      : undefined}
                  </Paragraph>
                </ColorBox>
              </TextAlignRightBox>
            ) : null}
          </MonoFontBox>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          <MonoFontBox>
            <TextAlignRightBox>
              <Paragraph
                color={
                  upbitMarket.scr === 0
                    ? "gray30"
                    : upbitMarket.scr > 0
                    ? "greenLight"
                    : "redLight"
                }
              >
                {upbitMarket.tp.toLocaleString()}
              </Paragraph>
              <Paragraph
                color={
                  upbitMarket.scr === 0
                    ? "gray30"
                    : upbitMarket.scr > 0
                    ? "greenLight"
                    : "redLight"
                }
              >
                {binanceMarket
                  ? Number(
                      (
                        Number(binanceMarket.data.p) * upbitForex.basePrice
                      ).toFixed(priceDecimalLength)
                    ).toLocaleString()
                  : null}
              </Paragraph>
            </TextAlignRightBox>
          </MonoFontBox>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          <MonoFontBox>
            <TextAlignRightBox>
              <Paragraph
                color={
                  upbitMarket.scr === 0
                    ? "gray30"
                    : upbitMarket.scr > 0
                    ? "greenLight"
                    : "redLight"
                }
              >
                {changeRate.toFixed(2)}%
              </Paragraph>
              <Paragraph
                color={
                  upbitMarket.scr === 0
                    ? "gray30"
                    : upbitMarket.scr > 0
                    ? "greenLight"
                    : "redLight"
                }
              >
                {changePrice.toLocaleString()}
              </Paragraph>
            </TextAlignRightBox>
          </MonoFontBox>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          <MonoFontBox>
            <TextAlignRightBox>
              <Paragraph color="gray30">
                {koPriceLabelFormat(upbitMarket.atp24h)}
              </Paragraph>
              <Paragraph color="gray30">
                {/* {binanceMarket ? koPriceLabelFormat(binanceMarket.) : null} */}
              </Paragraph>
            </TextAlignRightBox>
          </MonoFontBox>
        </TableCellInnerBox>
      </TableCell>
    </TableRow>
  );
}, isEqual);
TableItem.displayName = "TableItem";

MarketTable.displayName = "MarketTable";

export default MarketTable;
