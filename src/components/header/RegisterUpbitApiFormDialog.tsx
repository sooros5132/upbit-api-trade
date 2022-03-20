import { Box, Typography, FormControl, TextField } from '@mui/material';
import { memo, useState } from 'react';
import isEqual from 'react-fast-compare';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import { FormDialog } from '../modules/dialog/Dialog';
import { useSnackbar } from 'notistack';
import { BackgroundRedBox, TextAlignCenterBox } from '../modules/Box';
import { HoverUnderLineSpan, UnderLineSpan } from '../modules/Typography';

interface RegisterUpbitApiFormDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
}

const RegisterUpbitApiFormDialog: React.FC<RegisterUpbitApiFormDialogProps> = ({
  open,
  onClose
}) => {
  const { enqueueSnackbar } = useSnackbar();
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
      onClose(false);
      return;
    }

    const registerResult = await registerKey(values.accessKey, values.secretKey);
    if (Array.isArray(registerResult)) {
      enqueueSnackbar('업비트 API에 연동되었습니다.', {
        variant: 'success'
      });
    } else {
      enqueueSnackbar(registerResult?.error?.message || '업비트 API 연동을 실패했습니다.', {
        variant: 'error'
      });
      return;
    }
    onClose(false);
    setValues({
      accessKey: '',
      secretKey: ''
    });
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      canCloseOnPending={false}
      title={<b>Upbit API키를 입력해주세요.</b>}
      buttons={[
        {
          isSubmitButton: false,
          returningIdentifier: 'cancel',
          title: '취소',
          color: 'secondary'
        },
        {
          isSubmitButton: true,
          returningIdentifier: 'submit',
          title: 'API 연동하기',
          color: 'primary'
        }
      ]}
    >
      <Box minWidth={350}>
        <TextAlignCenterBox>
          <BackgroundRedBox>
            <Typography>자산조회 기능만 사용이 가능합니다.</Typography>
            <Typography>API 권한을 다시 한번 확인하고 연동해주세요.</Typography>
            <Typography>API 사용 부주의로 인한 금전적 손실은 책임 지지 않습니다</Typography>
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
          <Typography>현재 API연동 기능을 사용할 수 없습니다.</Typography>
        </TextAlignCenterBox>
        <Box mt={1}>
          <Typography>Access key</Typography>
          <FormControl variant="filled" fullWidth>
            <TextField
              type="text"
              value={values.accessKey}
              fullWidth
              variant="outlined"
              placeholder="l0ug49ge..."
              required
              onChange={handleChangeValue('accessKey')}
            />
          </FormControl>
        </Box>
        <Box mt={1}>
          <Typography>Secret key</Typography>
          <FormControl variant="filled" fullWidth>
            <TextField
              type="text"
              value={values.secretKey}
              fullWidth
              variant="outlined"
              placeholder="yXgI17Mu..."
              required
              onChange={handleChangeValue('secretKey')}
            />
          </FormControl>
        </Box>
      </Box>
    </FormDialog>
  );
};

export default memo(RegisterUpbitApiFormDialog, isEqual);
