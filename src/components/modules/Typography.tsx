import classNames from 'classnames';

export const AskBidParagraph: React.FC<{
  state?: number;
  children?: React.ReactNode;
  className?: string;
}> = ({ className, state, children }) => {
  return (
    <p
      className={classNames(
        'font-mono',
        !state || state === 0 ? 'text-gray-400' : state > 0 ? 'text-teal-500' : 'text-rose-500',
        className
      )}
    >
      {children}
    </p>
  );
};

// export const SpanTypography = styled((props: TypographyProps) => (
//   <Typography component="span">{props.children}</Typography>
// ))();

// export const MonoFontTypography = styled(Typography)({
//   fontFamily: 'Roboto Mono,Trebuchet MS,roboto,ubuntu,sans-serif,monospace'
// });
// export const MonoFontSpanTypography = styled((props: TypographyProps) => (
//   <Typography component="span" {...props}>
//     {props.children}
//   </Typography>
// ))({
//   fontFamily: 'Roboto Mono,Trebuchet MS,roboto,ubuntu,sans-serif,monospace'
// });

// export const ColorInheritTypography = styled(Typography)({
//   color: 'inherit'
// });

// export const FontSizeInheritTypography = styled(Typography)({
//   fontSize: 'inherit'
// });

// export const InheritTypography = styled(Typography)({
//   fontSize: 'inherit',
//   color: 'inherit'
// });

// // 부모의 고정된 크기가 있어야 하고 overflow: hidden이 있어야 한다.
// export const EllipsisTypography = styled(Typography)({
//   overflow: 'hidden',
//   whiteSpace: 'nowrap',
//   textOverflow: 'ellipsis'
// });

// export const BreakSpacesTypography = styled(Typography)({
//   wordBreak: 'keep-all',
//   overflowWrap: 'anywhere'
// });

// export const BreakAllTypography = styled(Typography)({
//   wordBreak: 'break-all',
//   overflowWrap: 'break-word'
// });

// export const PreWrapTypography = styled(Typography)({
//   whiteSpace: 'pre-wrap'
// });

// export const PreLineTypography = styled(Typography)({
//   whiteSpace: 'pre-line'
// });

// export const HoverUnderLineSpan = styled((props: TypographyProps) => (
//   <Typography component="span" {...props}>
//     {props.children}
//   </Typography>
// ))({
//   cursor: 'pointer',
//   '&:hover': {
//     textDecoration: 'underline'
//   }
// });

// export const UnderLineSpan = styled((props: TypographyProps) => (
//   <Typography component="span" {...props}>
//     {props.children}
//   </Typography>
// ))({
//   cursor: 'pointer',
//   textDecoration: 'underline'
// });

// export const highlightKeyframes = keyframes`
//   0%{background-color:none}
//   10%{background-color:rgba(234,200,94,0.5)}
//   100%{background-color:none}
// `;

// export const AskBidTypography = styled(MonoFontTypography)<{
//   state?: number;
//   opacity?: number;
// }>(({ theme, state, opacity }) => ({
//   color:
//     !state || state === 0
//       ? theme.color.gray30
//       : state > 0
//       ? theme.color.bidMain
//       : theme.color.askMain,
//   opacity
// }));

// export const HighlightSpanTypography = styled('span')({
//   '&.highlight': {
//     animation: highlightKeyframes + ' 0.3s ease-out'
//   }
// });

// export const AskBidSpanTypography = styled(MonoFontSpanTypography)<{
//   state?: number;
//   opacity?: number;
// }>(({ theme, state, opacity }) => ({
//   color:
//     !state || state === 0
//       ? theme.color.gray30
//       : state > 0
//       ? theme.color.bidMain
//       : theme.color.askMain,
//   opacity
// }));
