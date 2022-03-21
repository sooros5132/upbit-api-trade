import { Box, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';
import isEqual from 'react-fast-compare';
import { IUpbitAccounts } from 'src-server/type/upbit';
import { useUpbitDataStore } from 'src/store/upbitData';
import { FlexAlignItemsCenterBox, FlexBox, GridBox, TextAlignRightBox } from '../modules/Box';
import {
  AskBidSpanTypography,
  AskBidTypography,
  HoverUnderLineSpan,
  MonoFontTypography
} from '../modules/Typography';
import { BsDot } from 'react-icons/bs';
import Link from 'next/link';
import { clientApiUrls } from 'src/utils/clientApiUrls';

const AccountsContainer = styled(FlexBox)(({ theme }) => ({
  paddingBottom: theme.spacing(1)
}));

const AccountsInner = styled(FlexAlignItemsCenterBox)(() => ({
  overflowX: 'auto',
  whiteSpace: 'nowrap'
}));

interface IAccountItemProps {
  account: IUpbitAccounts & { currentPrice?: number; totalBalance: number };
}

const AccountItem = memo(({ account }: IAccountItemProps) => {
  const { currentPrice } = account;
  if (!currentPrice) return null;

  const {
    avg_buy_price,
    avg_buy_price_modified,
    balance,
    currency,
    locked,
    unit_currency,
    totalBalance
  } = {
    avg_buy_price: Number(account.avg_buy_price),
    avg_buy_price_modified: account.avg_buy_price_modified,
    balance: Number(account.balance),
    currency: account.currency,
    locked: Number(account.locked),
    unit_currency: account.unit_currency,
    totalBalance: account.totalBalance
  };
  const profitAndLoss = Number((-((1 - currentPrice / avg_buy_price) * 100)).toFixed(2));
  const totalPurchaseValue = totalBalance * avg_buy_price;
  const appraisedValue = totalBalance * currentPrice;

  return (
    <>
      <FlexAlignItemsCenterBox>
        <BsDot />
        <Link href={`${clientApiUrls.upbit.marketHref + 'KRW-' + currency}`}>
          <a rel="noreferrer" target="_blank">
            <HoverUnderLineSpan fontWeight="bold">{currency}</HoverUnderLineSpan>
          </a>
        </Link>
        <Tooltip
          arrow
          title={
            <GridBox
              sx={{
                gridTemplateColumns: 'auto 1fr',
                columnGap: 0.5,
                rowGap: 0.5,
                fontSize: (theme) => theme.size.px14
              }}
            >
              <Typography>매수가</Typography>
              <TextAlignRightBox>
                <MonoFontTypography>{avg_buy_price.toLocaleString()}</MonoFontTypography>
              </TextAlignRightBox>
              <Typography>현재가</Typography>
              <TextAlignRightBox>
                <MonoFontTypography>{currentPrice.toLocaleString()}</MonoFontTypography>
              </TextAlignRightBox>
              <Typography>매수금액</Typography>
              <TextAlignRightBox>
                <MonoFontTypography>
                  {Math.round(totalPurchaseValue).toLocaleString()}
                </MonoFontTypography>
              </TextAlignRightBox>
              <Typography>평가금액</Typography>
              <TextAlignRightBox>
                <AskBidSpanTypography state={profitAndLoss}>
                  {Math.round(appraisedValue).toLocaleString()}
                </AskBidSpanTypography>
              </TextAlignRightBox>
              <Typography>평가손익</Typography>
              <TextAlignRightBox>
                <AskBidSpanTypography state={profitAndLoss}>
                  {Math.round(appraisedValue - totalPurchaseValue).toLocaleString()}
                </AskBidSpanTypography>
              </TextAlignRightBox>
              <Typography>보유수량</Typography>
              <TextAlignRightBox>
                <MonoFontTypography>{totalBalance.toFixed(8)}</MonoFontTypography>
              </TextAlignRightBox>
            </GridBox>
          }
        >
          <AskBidTypography state={profitAndLoss}>
            &nbsp;
            {`${Math.round(currentPrice * totalBalance).toLocaleString()}₩ ${profitAndLoss.toFixed(
              2
            )}%`}
          </AskBidTypography>
        </Tooltip>
      </FlexAlignItemsCenterBox>
    </>
  );
}, isEqual);

interface IMyAccountsProps {
  upbitAccounts: Array<IUpbitAccounts>;
}

function MyAccounts({ upbitAccounts: upbitAccountsTemp }: IMyAccountsProps) {
  const { marketSocketData } = useUpbitDataStore();
  const upbitAccounts = upbitAccountsTemp
    .map(
      (account) =>
        ({
          ...account,
          currentPrice: marketSocketData['KRW-' + account.currency]?.tp,
          totalBalance: Number(account.balance) + Number(account.locked)
        } as IAccountItemProps['account'])
    )
    .sort((a, b) => {
      if (!a.currentPrice) {
        return -1;
      } else if (!b.currentPrice) {
        return 1;
      }
      return b.currentPrice * b.totalBalance - a.currentPrice * a.totalBalance;
    });
  return (
    <AccountsContainer>
      <Tooltip title="KRW 마켓에 있는 코인만 지원합니다." arrow>
        <Typography>잔고&nbsp;</Typography>
      </Tooltip>
      <AccountsInner
        sx={{
          gridAutoColumns: 'auto',
          columnGap: 1
        }}
      >
        {upbitAccounts.map((account) => (
          <AccountItem key={`header-my-account-${account.currency}`} account={account} />
        ))}
      </AccountsInner>
    </AccountsContainer>
  );
}

AccountItem.displayName = 'AccountItem';

export default MyAccounts;
