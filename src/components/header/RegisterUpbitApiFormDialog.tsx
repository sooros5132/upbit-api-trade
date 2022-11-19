import { memo, useEffect, useState } from 'react';
import isEqual from 'react-fast-compare';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import { toast } from 'react-toastify';
import { BackgroundBlueBox, BackgroundRedBox } from '../modules/Box';
import classNames from 'classnames';
import axios from 'axios';
import { apiUrls, PROXY_PATH } from 'src/lib/apiUrls';
import useSWR from 'swr';

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
  const [apiServer, setApiServer] = useState(apiServerDefaultValue);

  const handleChangeValue =
    (prop: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prevValues) => ({
        ...prevValues,
        [prop]: event.target.value
      }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.accessKey || !values.secretKey) {
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
    <div
      className={classNames('modal bg-black/50 backdrop-blur-sm', open ? 'modal-open' : undefined)}
    >
      {/* <input type='checkbox' className='modal-toggle' onClick={() => onClose(false)} /> */}
      <div className='min-w-[200px] max-w-sm bg-base-200 p-8'>
        <form onSubmit={handleSubmit}>
          <div className='text-sm text-center'>
            <p>
              <span className='text-lg my-9'>
                <ApiServerIp />
              </span>
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
              type='text'
              className='w-full input'
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
            <button type='submit' className='basis-1/2 btn btn-success'>
              API 연동하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

type apiServerDefaultValueType = {
  loading: boolean;
  status: number;
  ip: null | string;
  lastCheck: null | Date;
};

const apiServerDefaultValue: apiServerDefaultValueType = {
  loading: false,
  status: 400,
  ip: null,
  lastCheck: new Date()
};

const ApiServerIp: React.FC = () => {
  const {
    data: ip,
    error,
    isValidating
  } = useSWR<string>(
    PROXY_PATH + '/api/ip',
    async (url) => {
      const res = await axios
        .get<string>(url)
        .then((res) => res.data)
        .catch(async () => {
          return await axios
            .get<string>(url + '.php')
            .then((res) => res.data)
            .catch(async () => {
              return await axios
                .get<string>('/api/ip')
                .then((res) => res.data)
                .catch(async () => 'error');
            });
        });

      return res || 'error';
    },
    {
      revalidateOnFocus: false
    }
  );

  if (isValidating) {
    return <b>아이피를 불러오는 중 입니다.</b>;
  }
  if (error || ip === 'error') {
    return <b>서버와 연결이 불안정하여 아이피를 확인할 수 없습니다.</b>;
  }

  return <b>{ip}</b>;
};

export default memo(RegisterUpbitApiFormDialog, isEqual);
