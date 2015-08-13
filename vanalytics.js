// ================================================================
// Copyright 2015 by Adib Behjat
// Source: adibbehjat.com/video-graph-analytics
// Author: Adib Behjat
// Available for everyone to use. If possible, 
// please place my GitHub name "https://github.com/adibbehjat"
// ================================================================

var vAnalytics = function(options)
{
	// Default values
	var default_arg = {
		'id': "v-analytics", // Container ID
		'video_url': "/youtube/darkknight.mp4",
		'width': 640,
		'height': 360,
		'graphColor': "red",
		'sliderColor': "white",
		'sliderWidth': 2,
		'bgColor': "rgba(0,0,0,0.1)",
		'data_input': [],
		'video_control': true,
		'results_id': "percent",
	}

	// Check if user input is undefined
	if (options != "undefined")
	{
		for (var index in default_arg) {
			if (typeof options[index] == "undefined")
				options[index] = default_arg[index];
		}
	} else {
		var options = {};
		for (var index in default_arg) {
			options[index] = default_arg[index];
		}
	}

	// Collect user input
	this.id 	= options['id'];
	this.width 	= options['width'];
	this.height = options['height'];
	this.videoURL = options['video_url'];
	this.graphColor 	= options['graphColor'];
	this.sliderColor 	= options['sliderColor'];
	this.sliderWidth 	= options['sliderWidth'];
	this.bgColor		= options['bgColor'];
	this.dataPnt 		= options['data_input'];
	this.video_control	= options['video_control'];
	this.results_id	= options['results_id'];

	// Initialize
	var _self = this;

	// Constants
	var START_POS = 0;
	var TICKS_TO_SECONDS = 3.97;

	this.draw = function () {
		// Initialize variables
		var graph_canvas = '<canvas id="graph" width="'+this.width+'" height="'+this.height+'"></canvas>';
		var slider_canvas = '<canvas id="slider" width="'+this.width+'" height="'+this.height+'"></canvas>';
		var video_canvas = '<video id="video" width="'+this.width+'" height="'+this.height+'"><source src="'+this.videoURL+'" type="video/mp4"></video>';
		$('#'+this.id).append(graph_canvas);
		$('#'+this.id).append(slider_canvas);
		$('#'+this.id).append(video_canvas);
		$('#graph').css('position','absolute');
		$('#graph').css('background-color',this.bgColor);
		$('#slider').css('position','absolute');

		var v = $('#video')[0];
		var l = $('#slider')[0];
		var c = $('#graph')[0];
		var videoAnalytics = this.dataPnt;
		var sliderWidth = this.sliderWidth;
		var graphColor = this.graphColor;
		var sliderColor = this.sliderColor;
		var resultDisplay = this.results_id;
		var videoControl = this.video_control;

		var graph = c.getContext('2d');
		var scrubline = l.getContext('2d');

		$(document).ready(function(){
			v.controls = videoControl;
			$(v).on("loadedmetadata", function(){
				draw_line(START_POS, sliderColor);
				build_graph(graphColor);
				v.addEventListener("seeking", onSeekingVideo);
				v.addEventListener("timeupdate", function(){
					onPlayingVideo(resultDisplay);
				});
			});
		});		

		$(v).on("click", function(){
			var x = getPos(event);
			var play_time = x*v.duration/v.width;
			v.currentTime = play_time;
			v.pause()
		})

		/* INTERNAL FUNCTIONS */

		// Collect X position of mouse
		function getPos(e) {
	        x = e.clientX;
	        var parentPos = $(l).parent().offset();
	        return x - parentPos.left;
	    }

	    // Collect Y Axis Value - this requires Smooth.js
		function collect_y(x) {
			// Smooth.js creates a smooth relationship between the lines
			// The x input should be in decimal point to provide ultimate
			// experience
			var s = Smooth(videoAnalytics, {
				method: Smooth.METHOD_CUBIC,
				cubicTension: 1
			});
			return s(x);
		}

		// Calculate number of pixels to data points
		function pixels_to_points() {
			var sec_to_pnts = v.duration / videoAnalytics.length;
			var ticks_to_pnts  = TICKS_TO_SECONDS * sec_to_pnts;
			var pixels_to_pnts = (v.width / (TICKS_TO_SECONDS * v.duration)) * ticks_to_pnts;
			return pixels_to_pnts;
		}

		// Draw the sliderline
		function draw_line(x_pos, color) {
			scrubline.strokeStyle = color;
			scrubline.lineWidth = sliderWidth;
			scrubline.moveTo(x_pos, 0);
			scrubline.lineTo(x_pos, l.height);
			scrubline.stroke();
			scrubline.closePath();
		}

		// Draw the graph
		function build_graph(graph_color) {

			// Define graphical defaults
			graph.strokeStyle = graph_color;
			graph.lineWidth = sliderWidth;
			graph.beginPath();

			var ppt = pixels_to_points();
			var ticker = 0
			var first = true;
			var y = 0;

			for (var x = 0; x <= v.width; x += 1) {

				ticker = x / ppt;
				
				// Collect data from index
				var result = collect_y(ticker);

				// Height of canvas divided by 2, the negative is designed to invert the graph
				y = -result + v.height/2 

				// If first position
				if(first){ 
					graph.moveTo(x,y); first = false;
				}

				// Print it
				graph.lineTo(x, y);
			}

			graph.stroke();
			graph.closePath();

		}

		// Event Listeners

		function onSeekingVideo() {
			var x = (v.width*v.currentTime/v.duration);
			l.width = l.width;
			draw_line(x,sliderColor);
		}

		function onPlayingVideo(output_id) {
			var x = (v.width*v.currentTime/v.duration);
			var pixels_to_pnts = pixels_to_points();
			value = collect_y(x/pixels_to_pnts) + 0.0001;
			value = value.toFixed(2);
			l.width = l.width;
			draw_line(x,sliderColor);
			$('#'+output_id).html(value + "%");
		}

	}
}