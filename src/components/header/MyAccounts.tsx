import { memo, useMemo, useRef } from 'react';
import isEqual from 'react-fast-compare';
import { IUpbitAccounts } from 'src-server/types/upbit';
import { BsDot } from 'react-icons/bs';
import { clientApiUrls } from 'src/utils/clientApiUrls';
import { useExchangeStore } from 'src/store/exchangeSockets';
import shallow from 'zustand/shallow';
import { AskBidParagraph } from '../modules/Typography';

interface IAccountItemProps {
  account: IUpbitAccounts & { currentPrice?: number; totalBalance: number };
}

const AccountItem = memo(({ account }: IAccountItemProps) => {
  const upbitMarketData = useExchangeStore(
    (state) => state?.upbitMarketDatas?.['KRW-' + account.currency],
    shallow
  );
  const currentPrice = account.currency === 'KRW' ? 1 : upbitMarketData?.tp;

  const {
    avg_buy_price,
    // avg_buy_price_modified,
    balance,
    currency,
    locked,
    // unit_currency,
    totalBalance
  } = {
    avg_buy_price: Number(account.avg_buy_price),
    // avg_buy_price_modified: account.avg_buy_price_modified,
    balance: Number(account.balance),
    currency: account.currency,
    locked: Number(account.locked),
    // unit_currency: account.unit_currency,
    totalBalance: account.totalBalance
  };
  const profitAndLoss = Number((-((1 - currentPrice / avg_buy_price) * 100)).toFixed(2));
  const totalPurchaseValue = totalBalance * avg_buy_price;
  const appraisedValue = totalBalance * currentPrice;

  const upbitLink =
    currency !== 'KRW'
      ? `${clientApiUrls.upbit.marketHref + 'KRW-' + currency}`
      : 'https://upbit.com/investments/balance';

  return (
    <>
      <div className='flex items-center text-sm'>
        <BsDot />
        <a href={upbitLink} rel='noreferrer' target='_blank'>
          <span className='font-bold hover:underline'>{currency}</span>
        </a>
        {currency !== 'KRW' ? (
          <div className='dropdown dropdown-hover dropdown-end'>
            <label tabIndex={0}>
              <AskBidParagraph state={profitAndLoss}>
                &nbsp;
                {`${Math.round(
                  currentPrice * totalBalance
                ).toLocaleString()}₩ ${profitAndLoss.toFixed(2)}%`}
              </AskBidParagraph>
            </label>
            <div className='dropdown-content grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 bg-base-300 p-2 [&>p:nth-child(even)]:text-right [&>p:nth-child(even)]:font-mono'>
              <p>매수가</p>
              <p>{avg_buy_price.toLocaleString()}</p>
              <p>현재가</p>
              <p>{currentPrice.toLocaleString()}</p>
              <p>매수금액</p>
              <p>{Math.round(totalPurchaseValue).toLocaleString()}</p>
              <p>평가금액</p>
              <AskBidParagraph state={profitAndLoss}>
                {Math.round(appraisedValue).toLocaleString()}
              </AskBidParagraph>
              <p>평가손익</p>
              <AskBidParagraph state={profitAndLoss}>
                {Math.round(appraisedValue - totalPurchaseValue).toLocaleString()}
              </AskBidParagraph>
              <p>보유수량</p>
              <p>{totalBalance.toFixed(8)}</p>
            </div>
          </div>
        ) : (
          <div className='dropdown dropdown-hover dropdown-end'>
            <label tabIndex={0}>
              <AskBidParagraph state={profitAndLoss}>
                &nbsp;
                {`${Math.round(balance + locked).toLocaleString()}₩`}
              </AskBidParagraph>
            </label>
            <div className='dropdown-content grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 bg-base-300 p-2 [&>p:nth-child(even)]:text-right [&>p:nth-child(even)]:font-mono'>
              <p>보유</p>
              <p>{Math.round(balance + locked).toLocaleString()}</p>
              <p>사용 가능</p>
              <p>{Math.round(balance).toLocaleString()}</p>
            </div>
          </div>
          // <Tooltip
          //   arrow
          //   title={
          //     <GridBox
          //       sx={{
          //         gridTemplateColumns: 'auto 1fr',
          //         columnGap: 0.5,
          //         rowGap: 0.5,
          //         fontSize: (theme) => theme.size.px14
          //       }}
          //     >
          //     </GridBox>
          //   }
          // >
          // </Tooltip>
          // <Tooltip
          //   arrow
          //   title={
          //     <GridBox
          //       sx={{
          //         gridTemplateColumns: 'auto 1fr',
          //         columnGap: 0.5,
          //         rowGap: 0.5,
          //         fontSize: (theme) => theme.size.px14
          //       }}
          //     >
          //       <Typography>보유 KRW</Typography>
          //       <TextAlignRightBox>
          //         <MonoFontTypography>
          //           {Math.round(balance + locked).toLocaleString()}
          //         </MonoFontTypography>
          //       </TextAlignRightBox>
          //       <Typography>사용 가능 KRW</Typography>
          //       <TextAlignRightBox>
          //         <MonoFontTypography>{Math.round(balance).toLocaleString()}</MonoFontTypography>
          //       </TextAlignRightBox>
          //     </GridBox>
          //   }
          // >
          // </Tooltip>
        )}
      </div>
    </>
  );
}, isEqual);

AccountItem.displayName = 'AccountItem';

interface IMyAccountsProps {
  upbitAccounts: Array<IUpbitAccounts>;
}

const MyAccounts = memo(({ upbitAccounts: upbitAccountsTemp }: IMyAccountsProps) => {
  const upbitMarketDatas = useExchangeStore(({ upbitMarketDatas }) => upbitMarketDatas, shallow);

  const upbitAccounts = useMemo(
    () =>
      upbitAccountsTemp
        .map(
          (account) =>
            ({
              ...account,
              totalBalance: Number(account.balance) + Number(account.locked),
              currentPrice:
                account.currency === 'KRW' ? 1 : upbitMarketDatas['KRW-' + account.currency]?.tp
            } as IAccountItemProps['account'])
        )
        .filter((a) => typeof a.currentPrice === 'number')
        .sort((a, b) => {
          if (typeof a.currentPrice !== 'number') {
            return 1;
          } else if (typeof b.currentPrice !== 'number') {
            return -1;
          }
          return b.currentPrice * b.totalBalance - a.currentPrice * a.totalBalance;
        }),
    [upbitAccountsTemp, upbitMarketDatas]
  );

  return (
    <div className='flex pb-2'>
      <div
        className='tooltip tooltip-right whitespace-nowrap'
        data-tip='KRW 마켓에 있는 코인만 지원합니다.'
      >
        <span>잔고&nbsp;</span>
      </div>
      <div className='flex flex-wrap items-center whitespace-nowrap gap-x-2'>
        {upbitAccounts.map((account) => (
          <AccountItem key={`header-my-account-${account.currency}`} account={account} />
        ))}
      </div>
    </div>
  );
}, isEqual);

MyAccounts.displayName = 'MyAccounts';

export default MyAccounts;
