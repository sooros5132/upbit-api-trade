import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import { GridBox } from '../Box';
import { useState } from 'react';

export interface LoadingDialogProps {
  title?: string | JSX.Element;
  content?: string | JSX.Element;
  buttons: Array<{
    title: string;
    returningIdentifier: string;
    isLoadingButton: boolean;
    variant?: ButtonProps['variant'];
    color?: ButtonProps['color'];
  }>;
  open: boolean;
  canCloseOnPending: boolean;
  onClose: (identifier?: string) => (event: any) => Promise<void>;
  DialogRootStyles?: DialogProps['sx'];
  disableAutoFocus?: boolean;
  disableEnforceFocus?: boolean;
  disableEscapeKeyDown?: boolean;
  disablePortal?: boolean;
  disableRestoreFocus?: boolean;
  disableScrollLock?: boolean;
  disableBackdropClick?: boolean;
}

export function LoadingDialog({
  title,
  content,
  buttons,
  open,
  canCloseOnPending,
  onClose,
  DialogRootStyles,
  disableAutoFocus = false,
  disableEnforceFocus = false,
  disableEscapeKeyDown = false,
  disablePortal = false,
  disableRestoreFocus = false,
  disableScrollLock = false,
  disableBackdropClick = false
}: LoadingDialogProps) {
  const [requesting, setRequesting] = useState(false);

  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (requesting && !canCloseOnPending) {
      return;
    }
    switch (reason) {
      case 'backdropClick': {
        if (disableBackdropClick) return;
        break;
      }
      case 'escapeKeyDown': {
        if (disableEscapeKeyDown) return;
        break;
      }
    }
    onClose(reason)(event);
  };

  const handleClickSendButton =
    (identifier?: string) => async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (requesting && !canCloseOnPending) {
        return;
      }
      setRequesting(true);
      await onClose(identifier)(event);
      setRequesting(false);
    };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      // onBackdropClick={disableBackdropClick ? (event) => event.preventDefault() : undefined}
      disableAutoFocus={disableAutoFocus}
      disableEnforceFocus={disableEnforceFocus}
      disableEscapeKeyDown={disableEscapeKeyDown}
      disablePortal={disablePortal}
      disableRestoreFocus={disableRestoreFocus}
      disableScrollLock={disableScrollLock}
      sx={DialogRootStyles}
      scroll="paper"
    >
      {title ? <DialogTitle>{title}</DialogTitle> : null}

      {content ? (
        <>
          <Divider />
          <DialogContent>{content}</DialogContent>
        </>
      ) : null}
      <Divider />
      {buttons.length > 0 ? (
        <DialogActions sx={{ p: 0 }}>
          <GridBox
            sx={{
              flex: '1 1 auto',
              p: 1.5,
              columnGap: 1.5,
              gridTemplateColumns: [...new Array(buttons.length)].map(() => '1fr').join(' ')
            }}
          >
            {buttons.map((button, index) =>
              button.isLoadingButton ? (
                <LoadingButton
                  key={`loading-dialog-button-${button.returningIdentifier}-${index}`}
                  variant={button.variant ? button.variant : 'contained'}
                  color={button.color}
                  loading={requesting}
                  fullWidth
                  onClick={handleClickSendButton(button.returningIdentifier)}
                >
                  {button.title}
                </LoadingButton>
              ) : (
                <Button
                  key={`loading-dialog-button-${button.returningIdentifier}-${index}`}
                  variant={button.variant ? button.variant : 'contained'}
                  color={button.color}
                  fullWidth
                  disabled={requesting}
                  onClick={onClose(button.returningIdentifier)}
                >
                  {button.title}
                </Button>
              )
            )}
          </GridBox>
        </DialogActions>
      ) : null}
    </Dialog>
  );
}

const DialogForm = styled('form')`
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

export interface FormDialogProps {
  title?: string | JSX.Element;
  buttons: Array<{
    title: string;
    returningIdentifier: string;
    isSubmitButton: boolean;
    variant?: ButtonProps['variant'];
    color?: ButtonProps['color'];
  }>;
  open: boolean;
  canCloseOnPending: boolean;
  onClose: (identifier?: string) => (event: any) => Promise<void>;
  DialogRootStyles?: DialogProps['sx'];
  disableAutoFocus?: boolean;
  disableEnforceFocus?: boolean;
  disableEscapeKeyDown?: boolean;
  disablePortal?: boolean;
  disableRestoreFocus?: boolean;
  disableScrollLock?: boolean;
  disableBackdropClick?: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  title,
  buttons,
  open,
  canCloseOnPending,
  onClose,
  DialogRootStyles,
  disableAutoFocus = false,
  disableEnforceFocus = false,
  disableEscapeKeyDown = false,
  disablePortal = false,
  disableRestoreFocus = false,
  disableScrollLock = false,
  disableBackdropClick = false,
  children
}) => {
  const [requesting, setRequesting] = useState(false);

  const handleClose = (identifier?: string) => async (event: any) => {
    if (requesting && !canCloseOnPending) {
      return;
    }
    switch (identifier) {
      case 'backdropClick': {
        if (disableBackdropClick) return;
        break;
      }
      case 'escapeKeyDown': {
        if (disableEscapeKeyDown) return;
        break;
      }
    }
    await onClose(identifier)(event);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequesting(true);
    await onClose('submit')(event);
    setRequesting(false);
  };

  return (
    <Dialog
      open={open}
      onClose={(e, r) => handleClose(r)(e)}
      // onBackdropClick={disableBackdropClick ? (event) => event.preventDefault() : undefined}
      disableAutoFocus={disableAutoFocus}
      disableEnforceFocus={disableEnforceFocus}
      disableEscapeKeyDown={disableEscapeKeyDown}
      disablePortal={disablePortal}
      disableRestoreFocus={disableRestoreFocus}
      disableScrollLock={disableScrollLock}
      sx={DialogRootStyles}
      scroll="paper"
    >
      <DialogForm onSubmit={handleSubmit}>
        {title ? <DialogTitle>{title}</DialogTitle> : null}

        <Divider />
        <DialogContent>{children}</DialogContent>
        <Divider />
        {buttons.length > 0 ? (
          <DialogActions sx={{ p: 0 }}>
            <GridBox
              sx={{
                flex: '1 1 auto',
                p: 1.5,
                columnGap: 1.5,
                gridTemplateColumns: [...new Array(buttons.length)].map(() => '1fr').join(' ')
              }}
            >
              {buttons.map((button, index) =>
                button.isSubmitButton ? (
                  <LoadingButton
                    key={`loading-dialog-button-${button.returningIdentifier}-${index}`}
                    type="submit"
                    variant={button.variant ? button.variant : 'contained'}
                    color={button.color}
                    loading={requesting}
                    fullWidth
                  >
                    {button.title}
                  </LoadingButton>
                ) : (
                  <Button
                    key={`loading-dialog-button-${button.returningIdentifier}-${index}`}
                    variant={button.variant ? button.variant : 'contained'}
                    color={button.color}
                    fullWidth
                    disabled={requesting}
                    onClick={handleClose(button.returningIdentifier)}
                  >
                    {button.title}
                  </Button>
                )
              )}
            </GridBox>
          </DialogActions>
        ) : null}
      </DialogForm>
    </Dialog>
  );
};
