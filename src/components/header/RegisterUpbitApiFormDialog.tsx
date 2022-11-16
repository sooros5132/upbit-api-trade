import { memo, useEffect, useState } from 'react';
import isEqual from 'react-fast-compare';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import { toast } from 'react-toastify';
import { BackgroundBlueBox, BackgroundRedBox } from '../modules/Box';
import classNames from 'classnames';
import axios from 'axios';
import { PROXY_PATH } from 'src/lib/apiUrls';

interface RegisterUpbitApiFormDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
}

type apiServerDefaultValueType = {
  loading: boolean;
  status: number;
  ip: null | string;
  lastCheck: null | Date;
};

const apiServerDefaultValue: apiServerDefaultValueType = {
  loading: true,
  status: 400,
  ip: null,
  lastCheck: new Date()
};

const RegisterUpbitApiFormDialog: React.FC<RegisterUpbitApiFormDialogProps> = ({
  open,
  onClose
}) => {
  const { registerKey } = useUpbitAuthStore();
  const [values, setValues] = useState({
    accessKey: '',
    secretKey: ''
  });
  const [apiServer, setApiServer] = useState(apiServerDefaultValue);

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

  useEffect(() => {
    if (!open) {
      return;
    }
    setApiServer((prev) => ({ ...prev, loading: true }));
    (async function () {
      const apiServerCheck = await axios
        .get<string>(PROXY_PATH + '/api/ip')
        .then((res) => res)
        .catch(async () => {
          return await axios
            .get<string>(PROXY_PATH + '/api/ip.php')
            .then((res) => res)
            .catch(async () => ({ status: 400, data: null }));
        });

      setApiServer((prev) => ({
        ...prev,
        loading: false,
        status: apiServerCheck.status,
        ip: apiServerCheck?.data || null,
        lastCheck: new Date()
      }));
    })();
  }, [open]);

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
            <p>
              {apiServer.loading === false && apiServer.status === 200 && apiServer.ip ? (
                <span className='my-9'>
                  <b>{apiServer.ip}</b>
                </span>
              ) : apiServer.loading === true ? (
                <b>아이피를 불러오는 중 입니다.</b>
              ) : (
                <b>서버와 연결이 불안정하여 아이피를 확인할 수 없습니다.</b>
              )}
              <br />
              <a
                className='underline'
                href='https://upbit.com/mypage/open_api_management'
                rel='noreferrer'
                target='_blank'
              >
                <span>Open API 관리</span>
              </a>
              에서 위 IP를 허용 IP에 등록해야 사용이 가능합니다.
            </p>
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
          <div className='mt-4 text-sm text-red-500'>
            <p>
              자산조회 기능만 사용이 가능합니다.&nbsp;API 사용 부주의로 인한 금전적 손실은 책임 지지
              않습니다.&nbsp;API 권한을 다시 한번 확인하고 연동해주세요.
            </p>
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
