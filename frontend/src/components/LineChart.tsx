import * as React from "react";
import { Line, Serie } from "@nivo/line";
import {useTranslation} from "../i18n";
import AutoSizer from "react-virtualized-auto-sizer";
import theme from "../theme";

interface LineChartProps {
    data: Serie[];
    className?: string;
}

const LineChart = ({ data }: LineChartProps) => {
    const { t } = useTranslation();

    return (
        <AutoSizer>
            {({ height, width }) => (
                <div style={{
                    width,
                    height
                }}>
                    <Line
                        data={data}
                        width={width <= 0 ? 0 : width}
                        height={height <= 0 ? 0 : height}
                        margin={{ top: 32, right: 16, bottom: 48, left: 48 }}
                        xScale={{type: 'point'}}
                        yScale={{type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false}}
                        curve="natural"
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: 'bottom',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: t('dashboard.date'),
                            legendOffset: 36,
                            legendPosition: 'middle'
                        }}
                        axisLeft={{
                            orient: 'left',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: t('dashboard.warningCount'),
                            legendOffset: -40,
                            legendPosition: 'middle'
                        }}
                        enableGridX={false}
                        colors={theme.palette.secondary.light}
                        pointSize={8}
                        pointColor={{from: 'color', modifiers: []}}
                        pointBorderWidth={2}
                        pointBorderColor={{from: 'serieColor'}}
                        pointLabel="y"
                        pointLabelYOffset={-12}
                        enableCrosshair={false}
                        useMesh={true}
                        legends={[]}
                    />
                </div>
            )}
        </AutoSizer>
    );
};

export default LineChart;
