import { memo, useState } from 'react';
import isEqual from 'react-fast-compare';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import { toast } from 'react-toastify';
import { BackgroundBlueBox, BackgroundRedBox } from '../modules/Box';
import classNames from 'classnames';

interface RegisterUpbitApiFormDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
}

const RegisterUpbitApiFormDialog: React.FC<RegisterUpbitApiFormDialogProps> = ({
  open,
  onClose
}) => {
  const { registerKey } = useUpbitAuthStore();
  const [values, setValues] = useState({
    accessKey: '',
    secretKey: ''
  });

  const handleChangeValue =
    (prop: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prevValues) => ({
        ...prevValues,
        [prop]: event.target.value
      }));
    };

  const handleClose = (prop?: string) => async (event: any) => {
    if (prop !== 'submit' || !values.accessKey || !values.secretKey) {
      toast.info('모두 입력해주세요.');
      return;
    }

    const registerResult = await registerKey(values.accessKey.trim(), values.secretKey.trim());
    if (Array.isArray(registerResult)) {
      onClose(false);
      toast.success('업비트 API에 연동되었습니다.');
    } else {
      toast.error(registerResult?.error?.message || '업비트 API 연동을 실패했습니다.');
      return;
    }
    setValues({
      accessKey: '',
      secretKey: ''
    });
  };

  return (
    <>
      <input type='checkbox' className='modal-toggle' onClick={() => onClose(false)} />
      <div
        className={classNames(
          'modal bg-black/50 backdrop-blur-sm',
          open ? 'modal-open' : undefined
        )}
      >
        <div className='min-w-[200px] max-w-sm bg-base-200 p-8'>
          <div className='text-sm text-center'>
            <BackgroundRedBox>
              <div className='px-4'>
                <span>자산조회 기능만 사용이 가능합니다.</span>
                <span>API 권한을 다시 한번 확인하고 연동해주세요.</span>
                <span>API 사용 부주의로 인한 금전적 손실은 책임 지지 않습니다</span>
              </div>
            </BackgroundRedBox>
            {/* <Typography>
            <b>76.76.21.21</b> - 현재 접속한 서버 아이피입니다.
          </Typography>
          <Typography>
            <a href="https://upbit.com/mypage/open_api_management" rel="noreferrer" target="_blank">
              <UnderLineSpan>Open API 관리</UnderLineSpan>
            </a>
            에서 허용 IP에 등록해야 사용이 가능합니다.
          </Typography> */}
            <BackgroundBlueBox>
              <div className='px-4'>
                <span>
                  현재 운영중인 서버가 고정아이피가 아니므로 업비트 API연동을 이용할 수 없습니다.
                </span>
              </div>
            </BackgroundBlueBox>
          </div>
          <div className='mt-4'>
            <p>Access key</p>
            <input
              type='text'
              value={values.accessKey}
              placeholder='l0ug49ge...'
              className='w-full input'
              required
              onChange={handleChangeValue('accessKey')}
            />
          </div>
          <div className='mt-4'>
            <p>Secret key</p>
            <input
              className='w-full input'
              type='text'
              value={values.secretKey}
              placeholder='yXgI17Mu...'
              required
              onChange={handleChangeValue('secretKey')}
            />
          </div>
          <div className='mt-4 flex-center'>
            <button className='basis-1/2 btn' onClick={() => onClose(false)}>
              취소
            </button>
            <button className='basis-1/2 btn btn-success' onClick={handleClose('submit')}>
              API 연동하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(RegisterUpbitApiFormDialog, isEqual);
