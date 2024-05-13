import ReactApexChart from 'react-apexcharts'
// docs https://apexcharts.com/docs/installation/
function TimelineChart({ ejecution_data, ocupado_data, en_espera_data, planificador_data, labels_array, ticks }) {
    const series = [
        {
            name: 'En Ejecucion',
            color: '#00E396',
            data: ejecution_data
        },
        {
            name: 'En Espera',
            color: '#f0f0f0',
            data: en_espera_data

        },
        {
            name: 'Ocupado',
            color: '#FF4560',
            data: ocupado_data
        },
        {
            name: 'Planificador',
            color: '#775DD0',
            data: planificador_data
        },
    ];
    const options = { //docs https://apexcharts.com/docs/options/
        chart: {
            height: '100%',
            type: 'rangeBar',
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false,
            },
            dropShadow: {
                enabled: true,
                top: 0,
                left: 0,
                blur: 1,
                color: '#000',
                opacity: 1
            }

        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '50%',
                rangeBarGroupRows: true
            }
        },
        xaxis: {
            type: 'numeric',
            stepSize: 1,
            min: 0,
            max: ticks,
            labels: {
                style: {
                    colors: '#f0f0f0',
                },
                offsetX: -15,
            },

        },
        yaxis: {
            labels: {
                style: {
                    colors: '#f0f0f0'
                }
            },
            tooltip: {
                enabled: false,
            },
        },
        fill: {
            type: 'solid'
        },
        legend: {
            position: 'bottom',
            onItemClick: {
                toggleDataSeries: false
            },
            onItemHover: {
                highlightDataSeries: true
            },
            showForNullSeries: true,
            labels: {
                colors: "#fff",
            }
        },
        grid: {
            show: false,
        },
        tooltip: {
            enabled: false
        },
        states: {
            normal: {
                filter: {
                    type: 'none',
                    value: 0,
                }
            },
            hover: {
                filter: {
                    type: 'none',
                    value: 0.15,
                }
            },
            active: {
                filter: {
                    type: 'none',
                    value: 0.35,
                }
            },
        },
        noData: {
            text: "No hay datos para mostrar",
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: -50,
            style: {
                color: "#fff",
                fontSize: '50px',
                fontFamily: undefined
            }
        },
        labels: labels_array,
    }

    return (
        <div>
            <div id="chart">
                <ReactApexChart options={options} series={series} type="rangeBar" height={400} width={1200} />
            </div>
        </div>
    );
};




export default TimelineChart