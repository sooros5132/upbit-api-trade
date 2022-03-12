import React, { useContext } from "react";
import {
  IUpbitForex,
  IUpbitMarket,
  IUpbitSocketMessageTickerSimple,
} from "src/types/upbit";
import styled from "styled-components";
import UpbitWebSocket, { UpbitWebSocketContext } from "../websocket/Upbit";
import _ from "lodash";
import {
  FlexAlignItemsCenterBox,
  FlexBox,
  TextAlignRightBox,
} from "../modules/Box";
import {
  HoverUnderLineAnchor,
  MonoFontTypography,
  Paragraph,
} from "../modules/Typography";
import { koPriceLabelFormat } from "src/utils/utils";
import isEqual from "react-fast-compare";
import BinanceWebSocket, {
  BinanceWebSocketContext,
} from "../websocket/Binance";
import { IBinanceSocketMessageTicker } from "src/types/binance";

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
    background-color: ${({ theme }) => theme.palette.absolutlyWhite + "33"};
  }
`;

const TableRow = styled.tr`
  min-width: ${({ theme }) => theme.spacing(5)};
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

const TableCell = styled.td`
  line-height: 1.25em;
  font-size: ${({ theme }) => theme.size.px14};
`;
const TableCellInnerBox = styled.div``;

const MarketIconBox = styled(FlexAlignItemsCenterBox)`
  width: ${({ theme }) => theme.size.px14};
  max-height: 1.25em;
`;

const MarketIconImage = styled.img`
  width: 100%;
`;

const Col = styled.col`
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

const NameCol = styled(Col)`
  width: auto;
`;
const PriceCol = styled(Col)`
  width: 10%;
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
}

interface MarketListProps {
  upbitForex: IUpbitForex;
  upbitKrwList: Array<IUpbitMarket>;
}

const MarketList: React.FC<MarketListProps> = ({
  upbitForex,
  upbitKrwList,
}) => {
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
              <NameCol />
              <PriceCol />
              <ChangeCol />
              <VolumeCol />
            </colgroup>
            <Thead>
              <TableRow>
                <TableCell>
                  <TableCellInnerBox>이름</TableCellInnerBox>
                </TableCell>
                <TableCell>
                  <TextAlignRightBox>시세차이</TextAlignRightBox>
                </TableCell>
                <TableCell>
                  <TextAlignRightBox>현재가</TextAlignRightBox>
                </TableCell>
                <TableCell>
                  <TextAlignRightBox>전일 대비</TextAlignRightBox>
                </TableCell>
                <TableCell>
                  <TextAlignRightBox>거래대금</TextAlignRightBox>
                </TableCell>
              </TableRow>
            </Thead>
            <TableBody upbitForex={upbitForex} />
          </Table>
        </TableContainer>
      </BinanceWebSocket>
    </UpbitWebSocket>
  );
};

const TableBody = React.memo<{
  upbitForex: IUpbitForex;
}>(({ upbitForex }) => {
  const upbitRealtimeMarket = useContext(UpbitWebSocketContext);
  const binanceRealtimeMarket = useContext(BinanceWebSocketContext);
  const list = Object.values(upbitRealtimeMarket).sort(
    (a, b) => b.atp24h - a.atp24h
  );
  return (
    <Tbody>
      {list.map((market) => {
        const binanceItem =
          binanceRealtimeMarket[market.cd.replace(krwRegex, "") + "USDT"];

        return (
          <TableItem
            key={`market-table-${market.cd}`}
            upbitMarket={market}
            binanceMarket={binanceItem}
            upbitForex={upbitForex}
          />
        );
      })}
    </Tbody>
  );
}, isEqual);

TableBody.displayName = "TableBody";

const TableItem = React.memo<{
  upbitMarket: IMarketTableItem;
  upbitForex: IUpbitForex;
  binanceMarket?: IBinanceSocketMessageTicker;
}>(({ upbitMarket, binanceMarket, upbitForex }) => {
  const changeRate = Number(upbitMarket.scr * 100);
  const changePrice = upbitMarket.tp - upbitMarket.op;
  const usdtName = upbitMarket.cd.replace(krwRegex, "") + "USDT";
  const binancePrice = binanceMarket
    ? Number(binanceMarket.data.p) * upbitForex.basePrice
    : undefined;
  const krwPrimium = binancePrice
    ? (1 - binancePrice / upbitMarket.tp) * 100
    : undefined;
  const priceIntegerLength = String(upbitMarket.tp).replace(
    /\.[0-9]+$/,
    ""
  ).length;
  const priceDecimalLength = String(upbitMarket.tp).replace(
    /^[0-9]+\.?/,
    ""
  ).length;
  return (
    <TableRow>
      <TableCell>
        <TableCellInnerBox>
          <FlexBox>
            <MarketIconBox>
              <MarketIconImage
                src={`https://static.upbit.com/logos/${upbitMarket.cd.replace(
                  krwRegex,
                  ""
                )}.png`}
                alt={`${upbitMarket.cd}-icon`}
              />
            </MarketIconBox>
            <FlexAlignItemsCenterBox>
              &nbsp;
              <HoverUnderLineAnchor
                href={`https://upbit.com/exchange?code=CRIX.UPBIT.${upbitMarket.cd}`}
                target="_blank"
              >
                <Paragraph color="textBlueGray">
                  {upbitMarket.korean_name}
                </Paragraph>
              </HoverUnderLineAnchor>
            </FlexAlignItemsCenterBox>
          </FlexBox>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          <TextAlignRightBox>
            {krwPrimium ? (
              <Paragraph
                color={
                  krwPrimium === 0
                    ? "textBlueGray"
                    : krwPrimium > 0
                    ? "greenLight"
                    : "redLight"
                }
              >
                {krwPrimium.toFixed(2).padStart(2, "0")}%
              </Paragraph>
            ) : null}
          </TextAlignRightBox>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <TableCellInnerBox>
          <MonoFontTypography>
            <TextAlignRightBox>
              <Paragraph
                color={
                  upbitMarket.scr === 0
                    ? undefined
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
                    ? undefined
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
          </MonoFontTypography>
        </TableCellInnerBox>
      </TableCell>
      <TableCell>
        <MonoFontTypography>
          <TextAlignRightBox>
            <Paragraph
              color={
                upbitMarket.scr === 0
                  ? "textBlueGray"
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
                  ? "textBlueGray"
                  : upbitMarket.scr > 0
                  ? "greenLight"
                  : "redLight"
              }
            >
              {changePrice.toLocaleString()}
            </Paragraph>
          </TextAlignRightBox>
        </MonoFontTypography>
      </TableCell>
      <TableCell>
        <TextAlignRightBox>
          <Paragraph color="textBlueGray">
            {koPriceLabelFormat(upbitMarket.atp24h)}
          </Paragraph>
          <Paragraph color="textBlueGray">
            {/* {binanceMarket ? koPriceLabelFormat(binanceMarket.) : null} */}
          </Paragraph>
        </TextAlignRightBox>
      </TableCell>
    </TableRow>
  );
}, isEqual);
TableItem.displayName = "TableItem";
MarketList.displayName = "MarketList";

export default MarketList;
