import { darkScrollbar } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';
import { tabsClasses } from '@mui/material/Tabs';
import CommonTheme from './CommomTheme';
// import indigo from '@mui/material/colors/indigo';
// import red from '@mui/material/colors/red';
// import pink from '@mui/material/colors/pink';
// import green from '@mui/material/colors/green';
// import lightBlue from '@mui/material/colors/lightBlue';
// import amber from '@mui/material/colors/amber';
// import { purple } from '@mui/material/colors';

export const DarkColor: typeof CommonTheme['color'] = {
  ...CommonTheme['color'],
  white: '#000000',
  black: '#ffffff'
};

const DarkTheme: ThemeOptions = {
  color: DarkColor,
  palette: {
    mode: 'dark'
    // success: {
    //     main: green[500],
    //     dark: green[300],
    //     light: green[500],
    // },
    // primary: {
    //   main: purple[300],
    //   dark: purple[600],
    //   light: purple[200]
    // }
    // secondary: {
    //     main: lightBlue[500],
    //     dark: lightBlue[300],
    //     light: lightBlue[500],
    // },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          ...darkScrollbar()
        }
      }
    },
    MuiTypography: {
      defaultProps: {
        // color: DarkColor.textDefaultBlack
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: true,
        disableFocusRipple: true,
        disableTouchRipple: true
      },
      styleOverrides: {
        root: {
          minWidth: 'initial',
          // padding: "initial",
          textTransform: 'none'
        },
        contained: {
          // background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
        },
        containedPrimary: {
          backgroundColor: DarkColor.main,
          color: DarkColor.gray10
        },
        containedSecondary: {
          backgroundColor: DarkColor.secondaryMain,
          color: DarkColor.gray10
        },
        outlined: {}
      },
      variants: [
        {
          props: { size: 'small' },
          style: {
            paddingLeft: 9,
            paddingRight: 9,
            paddingTop: 3,
            paddingBottom: 3
          }
        },
        {
          props: { variant: 'contained', disabled: true },
          style: {
            color: DarkColor.gray30,
            backgroundColor: DarkColor.gray10,
            '&:hover': {
              color: DarkColor.gray40,
              backgroundColor: DarkColor.gray15
            }
          }
        },
        {
          props: { variant: 'outlined', disabled: true },
          style: {
            color: DarkColor.gray30,
            backgroundColor: DarkColor.gray10,
            '&:hover': {
              color: DarkColor.gray40,
              backgroundColor: DarkColor.gray20
            }
          }
        },
        {
          props: { variant: 'contained', color: 'success' },
          style: {
            backgroundColor: DarkColor.greenMain,
            color: DarkColor.textDefaultWhite
          }
        },
        {
          props: { variant: 'contained', color: 'error' },
          style: {
            backgroundColor: DarkColor.redMain,
            color: DarkColor.textDefaultWhite
          }
        },
        {
          props: { variant: 'outlined', color: 'error' },
          style: {}
        },
        {
          props: { variant: 'outlined', color: 'info' },
          style: {
            borderColor: DarkColor.blueMain,
            backgroundColor: DarkColor.blueDark
          }
        },
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {}
        },
        {
          props: { variant: 'outlined', color: 'secondary' },
          style: {}
        },
        {
          props: { variant: 'outlined', color: 'success' },
          style: {}
        },
        {
          props: { variant: 'outlined', color: 'warning' },
          style: {}
        }
        // {
        //   props: { variant: 'containedDisable' },
        //   style: {
        //     color: DarkColor.gray40,
        //     backgroundColor: DarkColor.gray20,
        //     '&:hover': {
        //       color: DarkColor.gray50,
        //       backgroundColor: DarkColor.gray30
        //     }
        //   }
        // },
        // {
        //   props: { variant: 'outlinedDisable' },
        //   style: {
        //     color: DarkColor.gray30,
        //     borderStyle: 'solid',
        //     borderColor: DarkColor.gray15,
        //     borderWidth: 1,
        //     borderRadius: 4,
        //     '&:hover': {
        //       borderColor: DarkColor.gray20,
        //       backgroundColor: DarkColor.gray05
        //     }
        //   }
        // },
        // {
        //   props: { variant: 'textDisable' },
        //   style: {
        //     border: 0,
        //     color: DarkColor.gray40,
        //     '&:hover': {
        //       color: DarkColor.gray50,
        //       backgroundColor: DarkColor.gray20
        //     }
        //   }
        // },
        // {
        //   props: { variant: 'containedGray' },
        //   style: {
        //     color: DarkColor.gray50,
        //     backgroundColor: DarkColor.gray15,
        //     '&:hover': {
        //       color: DarkColor.gray65,
        //       backgroundColor: DarkColor.gray20
        //     }
        //   }
        // },
        // {
        //   props: { variant: 'outlinedGray' },
        //   style: {
        //     color: DarkColor.gray50,
        //     borderStyle: 'solid',
        //     borderColor: DarkColor.gray20,
        //     borderWidth: 1,
        //     borderRadius: 4,
        //     '&:hover': {
        //       borderColor: DarkColor.gray30,
        //       backgroundColor: DarkColor.gray10
        //     }
        //   }
        // },
        // {
        //   props: { variant: 'textGray' },
        //   style: {
        //     color: DarkColor.gray50,
        //     '&:hover': {
        //       color: DarkColor.gray50,
        //       backgroundColor: DarkColor.gray10
        //     }
        //   }
        // }
      ]
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          [`& .${tabsClasses.scroller}`]: {
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: DarkColor.textBlueGray
          }
        }
      }
    }
  }
};

export default DarkTheme;
