import dynamic from 'next/dynamic';
import type { TVChartProps } from './TVChart';
const TVChartInner = dynamic(() => import('./TVChart').then((res) => res.TVChartInner), {
  ssr: false
});

// export default 사용할 경우 빌드때 스크립트를 불러오므로 여기는 적용하면 안된다. + dynamic
export const TVChart: React.FC<TVChartProps> = (props) => {
  return <TVChartInner {...props} />;
};
