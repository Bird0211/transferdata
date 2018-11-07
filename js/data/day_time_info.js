var dom = document.getElementById("container");
var myChart = echarts.init(dom,'vintage');
var app = {};
/*
function randomData() {
    now = new Date(+now + oneDay);
    value = value + Math.random() * 21 - 10;
    return {
        name: now.toString(),
        value: [
            [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
            Math.round(value)
        ]
    }
}

var data = [];
var now = +new Date(1997, 9, 3);
var oneDay = 24 * 3600 * 1000;
var value = Math.random() * 1000;
for (var i = 0; i < 1000; i++) {
    data.push(randomData());
}*/

var option = {
    title: {
        text: 'Real-Time Anlysis'
    },
    tooltip: {
        trigger: 'axis',
        formatter: function (params) {
            params = params[0];
            // var date = new Date(params.name);
            // return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
            return params.name +' '+  params.value[1];
        },
        axisPointer: {
            animation: false
        }
    },
    xAxis: {
        type: 'category',
        splitLine: {
            show: false
        }
    },
    yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
            show: false
        }
    }
    ,
    series: [{
        name: '销售数据',
        type: 'bar',
        showSymbol: false,
        hoverAnimation: false,
        data: null,
        // smooth: true
    }]
};

/*
setInterval(function () {

    for (var i = 0; i < 5; i++) {
        data.shift();
        data.push(randomData());
    }

    myChart.setOption({
        series: [{
            data: data
        }]
    });
}, 1000);;
*/
/*
if (option && typeof option === "object") {
    myChart.setOption(option, true);
}
*/