

CHART_CONFIG = {
    type: "line",
    chart: {
        type: this.type,
        zoomType: 'x',
        panning: true,
        panKey: 'shift',
        className: 'anno_chart_real',
        height: '',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.0)',

    },

    title: {
        text: 'PRICE to CHAT CHART'
    },
    subtitle: {
        text: 'Click an annotation to see the messages from that time-range.'
    },

    annotations: [{
        labelOptions: {
            backgroundColor: 'rgba(50,50,50,0.5)',
            verticalAlign: 'top',
            y: 30,
            useHTML: true
        },
        labels: []  //populate
    }],

    xAxis: {
        labels: {
        },
        title: {
            text: 'Date'
        }
    },

    yAxis: {
        startOnTick: true,
        endOnTick: false,
        maxPadding: 0.35,
        title: {
            text: "Price (BTC-USD)"
        },
        labels: {
        }
    },

    tooltip: {
        shared: true
    },

    legend: {
        enabled: false
    },

    series: [{
        type: this.type,
        data: this.chartData,
        lineColor: Highcharts.getOptions().colors[1],
        color: Highcharts.getOptions().colors[5],
        fillOpacity: 0.5,
        name: 'Price (USD)',
        marker: {
            enabled: false
        },
        threshold: null
    }]

}



CHART_CONFIG.addData = function(_formatted_data) {
  console.log("ADDING ", _formatted_data)
  this.series[0].data = _formatted_data
}

CHART_CONFIG.addAnnotations = function(_formatted_data) {
  console.log("ANNOTATING: ", _formatted_data)
  this.annotations[0].labels = _formatted_data
}
