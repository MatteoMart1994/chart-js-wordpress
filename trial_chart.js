$(document).ready(function () {
	showDisticnt();
});
$('#type').on('change', function(){
        showDisticnt();
});

$('#select_button').on('change', function(){
		window.selected_window = this.value;
        showDisticnt();
});

$('#select_button_end').on('change', function(){
        window.selected_window_end = this.value;
		showDisticnt();
});

$('#checkbox1').change(function() {
    if(this.checked) {
        window.integrated_series = true;
    }
    else{
        window.integrated_series = false;
    }
    showDisticnt();
});


$(window).bind("resize", function(){
    var userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
    } else if (
    /iPad|iPhone|iPod/.test(platform) ||
    (platform === 'MacIntel' && window.navigator.maxTouchPoints > 1))
    {
    os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
    } else if (/Android/.test(userAgent)) {
    os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
    }

    
    if(os == 'Android' || os == 'iOS') {
        screenOrientation = ($(window).width() > $(window).height())? 90 : 0;
        if(screenOrientation !== 0){
            document.getElementById('chart-container').style.height='110vh';
            document.getElementById('chart-container').style.width='90vw';

        }
        else{
            document.getElementById('chart-container').style.height='90vh';
            document.getElementById('chart-container').style.width='80vw';
        }
        }
    else{
        document.getElementById('chart-container').style.height='70vh';
    }
});


window.chartColors ={'Parma Calcio 1913': [
    "#ffd200",
    "#1b4094"],
'AC Milan': [
    "#fb090b",
    "#000"
],
'Fiorentina': [
    "#482e92",
    "#482e92"
], 
'Torino': [
    "#8a1e03",
    "#8a1e03"
], 
'Roma': [
    "#8e1f2f",
    "#F0BC42"
], 
'Verona': [
    "#005395",
    "#ffe74a"
], 
'Napoli': [
    "#12A0D7",
    "#003c82"
], 
'Crotone': ['rgb(26, 26, 255)','rgb(26, 26, 255)'], 
'Genoa': [
    "#ffffff",
    "#ad1919"
    // "#073445"
], 
'Cagliari': [
    "#ad002a",
    "#002350"
], 
'Sassuolo': [
    "#000000",
    "#00a752"
], 
'Juventus': [
    "#000",
    "#000"
],
'Sampdoria': [
    "#FFFFFF",
    "#1b5497"
], 
'Bologna': [
    "#1a2f48",
    "#a21c26"
], 
'Atalanta': [
    "#1e71b8",
    "#000000"
], 
'Benevento': [
    "#fff200",
    "#ed1b23"
], 
'Lazio': [
    "#ffffff",
    "#87d8f7"
], 
'Inter': [
    "#221F20",
    "#0068A8"
], 
'Spezia': ['#7F7F7F', '#7F7F7F'],
'Udinese': ["#000000", "#8B7D37"] 
};

// Create select drop_down
function create_drop_down_window(select_id, start, length){
var x = document.getElementById(select_id);
if (x.length <= 1){
for (i=start; i<= length - 1;i++){
var option = document.createElement("option");
option.text= `${i}`;
x.add(option)};}}

function showDisticnt(){
    var col_evaluation = document.getElementById('type').value;
  {
    $.post(my_ajax_object.ajax_url,
        {
            action: 'query_db',
            selection: col_evaluation
        },
    function (data)
    {
       
        // console.log(data);
        const json_data = JSON.parse(data);
        datasets = [];
        labels = [];
        array_giornata = [];
        team_matches = [];

        Object.values(json_data).forEach(element => {
            team_matches.push(element['value'].length);
        });

        var total_length = Math.max(...team_matches);
        
		if (typeof window.selected_window == 'undefined' && typeof window.selected_window_end == 'undefined') {
			 window.considered_start = 1;
            window.considered_end = total_length;
		}
		else if (typeof window.selected_window !== 'undefined' && typeof window.selected_window_end == 'undefined'){
			window.considered_start = window.selected_window;
            window.considered_end = total_length;
		}
        else if (typeof window.selected_window == 'undefined' && typeof window.selected_window_end !== 'undefined'){
            window.considered_start = 1;
            window.considered_end = window.selected_window_end;
        }
		else if (typeof window.selected_window !== 'undefined' && typeof window.selected_window_end !== 'undefined'){
            window.considered_start = window.selected_window;
            window.considered_end = window.selected_window_end;
        }

        for (var i=parseInt(window.considered_start); i<= parseInt(window.considered_end);i++){
			array_giornata.push(`${i}`)};
		// Create select drop_down
		create_drop_down_window("select_button", 1, total_length);
        
        create_drop_down_window("select_button_end", 1, window.considered_end+1);

        // Hide smaller values
        var op = document.getElementById("select_button_end").getElementsByTagName("option");
        for (var i = 1; i < op.length; i++) {
            if (op[i].value < parseInt(document.getElementById("select_button").value)) {
                op[i].disabled = true;
            }
            else{
                op[i].disabled = false
            }
        }

        opponent_dict = []
        h_a_dict = []
        for (var team in json_data) {
            var colorName = window.chartColors[team][0];
            if  (typeof window.integrated_series == 'undefined' || window.integrated_series == false){
                var data = json_data[team]["value"].slice(window.considered_start-1, window.considered_end);
            }
            else if (window.integrated_series == true){
                var data = json_data[team]["value"].slice(window.considered_start-1, window.considered_end).map(function (val) { 
                    if (val == null){
                        val = 0;
                    }
                    return this.acc += parseFloat(val); }, { acc: 0 });
            } 
            opponent_dict[team] = json_data[team]["opponent"].slice(window.considered_start-1, window.considered_end); 
            h_a_dict[team] = json_data[team]["h_a"].slice(window.considered_start-1, window.considered_end); 
            
            datasets.push({label: team,
            // commented since https://github.com/chartjs/Chart.js/issues/2651
            // backgroundColor: window.chartColors[team][1],
            borderColor: window.chartColors[team][1],
            pointBackgroundColor: colorName,
            pointBorderColor: window.chartColors[team][1],
            fill: false,
            hidden: false,
            spanGaps: true,
            data : data})

        }
        var config = {
            type : 'line',
            data:{labels: array_giornata,
            datasets: datasets},
            options :{
                legend : {
                    labels: {
                        generateLabels: function(chart) {
                        labels = window.Chart.defaults.global.legend.labels.generateLabels(chart);
                        for (var key in labels) {
                            var team = labels[key].text;
                            labels[key].lineWidth  = 1;
                            labels[key].fillStyle  = window.chartColors[team][1];
                            labels[key].strokeStyle = window.chartColors[team][0]; 
                        }
                        return labels;
                        }
                    }
                }
                ,
                responsive: true,
                maintainAspectRatio: false,
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true
                },
                tooltips: {
                    callbacks: {
                        title: function(tooltipItems, data) {
                           if (window.integrated_series && tooltipItems[0].index > 0){
                            var value =  data.datasets[tooltipItems[0].datasetIndex].data[tooltipItems[0].index] - data.datasets[tooltipItems[0].datasetIndex].data[tooltipItems[0].index -1];
                        }
                        else {
                            var value =  data.datasets[tooltipItems[0].datasetIndex].data[tooltipItems[0].index]
                        }
                        
                        value = Math.floor(value * 100) / 100;
                        value = value.toFixed(2);
                        var _meta_opts = data.datasets[tooltipItems[0].datasetIndex]._meta;
                        var key = _meta_opts[Object.keys(_meta_opts)[0]].dataset._scale.options.scaleLabel.labelString;   
                        return key + ': ' + value;
                        },
                        footer: function(tooltipItems, data) {
                            var label_team = data.datasets[tooltipItems[0].datasetIndex].label;
                            var opponent =  opponent_dict[label_team][tooltipItems[0].index];
                            var h_a =  h_a_dict[label_team][tooltipItems[0].index];
                            switch (h_a) {
                                case 'h':
                                    var h_a_trad = 'home';  
                                    break;
                                case 'a':
                                    var h_a_trad = 'away';  
                                    break;                            
                            }

                            return 'Opponent' + ': ' + opponent + ', ' + h_a_trad;
                        },
                        label: function(tooltipItems, data) {
                            var label_team = data.datasets[tooltipItems.datasetIndex].label;  
                            return 'Team: ' + label_team;
                        },
                    }},
                scales:{xAxes: [{
						ticks:{fontSize: 18},
						display: true,
						scaleLabel: {
							display: true,
							fontSize: 18,
							labelString: 'Giornata'
						}
					}],
                    yAxes: [{
						ticks:{fontSize: 18},
						scaleLabel: {
							display: true,
							fontSize: 18,
							labelString: col_evaluation.charAt(0).toUpperCase() + col_evaluation.slice(1)
						}
					}]
                }
            }

        }
    
    if (window.Graph != null){
        var list_hidden = window.Graph.legend.legendItems.map(function(arr) { return arr.hidden})

        for (var i in list_hidden) {
            config.data.datasets[i].hidden = list_hidden[i];
        }
        window.Graph.destroy();
        
        }
    else{
        // console.log("Graph creating...");
    }


    var graphTarget = document.getElementById('graphCanvas').getContext('2d');
    window.Graph = new Chart(graphTarget, config);

    $("#toggle").click(function() {
        window.Graph.data.datasets.forEach(function(ds) {
                ds._meta[Object.keys(ds._meta)[0]].hidden = true;
        });
        window.Graph.update();
    });

    }
    );
    }
}(jQuery);
