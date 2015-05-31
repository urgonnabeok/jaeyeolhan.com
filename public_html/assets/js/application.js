jQuery(document).ready(function($) {
	
// Select nav for smaller resolutions
// Select menu for smaller screens
$("<select />").appendTo("nav#primary");

// Create default option "Menu"
$("<option />", {
   "selected": "selected",
   "value"   : "",
   "text"    : "Menu"
}).appendTo("nav#primary select");

// Populate dropdown with menu items
$("nav#primary a").each(function() {
 var el = $(this);
 $("<option />", {
     "value"   : el.attr("href"),
     "text"    : el.text()
 }).appendTo("nav select");
});

$("nav#primary select").change(function() {
  window.location = $(this).find("option:selected").val();
});

// Pretty Photo
$("a[class^='prettyPhoto']").prettyPhoto();

// Tipsy
$('.tooltip').tipsy({
	gravity: $.fn.tipsy.autoNS,
	fade: true,
	html: true
});

$('.tooltip-s').tipsy({
	gravity: 's',
	fade: true,
	html: true
});

$('.tooltip-e').tipsy({
	gravity: 'e',
	fade: true,
	html: true
});

$('.tooltip-w').tipsy({
	gravity: 'w',
	fade: true,
	html: true
});

// Scroll
jQuery.localScroll();

// Prettyprint
$('pre').addClass('prettyprint linenums');

// Uniform
$("select, input:checkbox, input:radio, input:file").uniform();
	
});


(function($){
	$.organizeGallery = function(data)
	{
		var PIN_IMAGE_WIDTH = 150;
		var PIN_PADDING_RL = 2;
		var PIN_PADDING_TOP = 3;
		var PIN_PADDING_BOTTOM = 6;

		var PIN_WIDTH = PIN_IMAGE_WIDTH + (PIN_PADDING_RL * 2);
		var PIN_HEIGHT_EXCEPT_IMAGE = PIN_PADDING_TOP + PIN_PADDING_BOTTOM;

		var PIN_GAP_WIDTH = 5;
		var PIN_GAP_HEIGHT = 5;

		var data;
		var isReady = false;
		var organized = false;

		var $container;
		var recentContainerWidth = 0;
		var recentColumnsNumber = 0;
		var $pins;

		$.getJSON('/gallery/data.json', function(galleryData){
			data = galleryData;
			checkBothReady();
		});

		$(document).ready(function(){
			isReady = true;
			checkBothReady();
		});

		function checkBothReady()
		{
			if (data && isReady && !organized)
			{
				organized = true;
				organize();
			}
		}

		function organize()
		{
			data.images.reverse();
			$pins = createPins(data.images);

			var boxCss = {
				'width': '100%',
				'box-sizing':'border-box',
				'-webkit-box-sizing':'border-box',
				'-moz-box-sizing':'border-box'
			};

			$('#main').css(boxCss);
			$('.boxed').css(boxCss);

			$container = $('#gallery_container');
			$container.css(boxCss);

			var $columns = setColumns();

			$container.append($columns);

			arrangePinsAlongColumns($pins, $columns);

			function onResize()
			{
				$columns = setColumns();
				if ($columns)
				{
					console.log('columns changed');
					$container.append($columns);
					arrangePinsAlongColumns($pins, $columns);
				}
			}

			$(window).resize(onResize);

			setTimeout(onResize, 100);

			return;
		}

		function createPins(list)
		{
			var $pins = $();
			var $prettyPhotoLinks = $();
			$.each(list, function(index, image){

				var $thumb = $('<img>', {
					'class': 'box_shadow',
					'src':'/gallery/thumb/' + image.thumbnail
				}).css({
					'width': PIN_IMAGE_WIDTH + 'px'
				});

				var sold = (image.sold) ? ' [SOLD]' : '';
				var titleForPrettyPhoto = '“' + image.title + '” ' + sold + '\n<br>' + image.material + ', ' + image.size + ', ' + image.date;
				var $link = $('<a>', {
					'rel': 'prettyPhoto[pp_gallery]',
					'href': '/gallery/original/' + image.original,
					'title': titleForPrettyPhoto
				});
				$prettyPhotoLinks = $prettyPhotoLinks.add($link);

				var $pin = $('<div>', {
					'class':'pin'
				}).css({
					'padding-top': PIN_PADDING_TOP,
					'padding-right': PIN_PADDING_RL,
					'padding-left': PIN_PADDING_RL,
					'padding-bottom': PIN_PADDING_BOTTOM
				});

				$pin.get(0)._thumbHeight = image.thumbnail_height;
				$link.append($thumb);
				$pin.append($link);
				$pins = $pins.add($pin);
			});

			$prettyPhotoLinks.prettyPhoto({'custom_markup':'abcdefg'});

			return $pins;
		}

		function setColumns()
		{
			var containerWidth = $container.width();

			var columnsNumber = Math.floor((containerWidth + PIN_GAP_WIDTH) / (PIN_WIDTH + PIN_GAP_WIDTH));

			var totalPinsAndGapsWidth = (columnsNumber * PIN_WIDTH) + ((columnsNumber - 1) * PIN_GAP_WIDTH);

			totalPinsAndGapsWidth = (totalPinsAndGapsWidth > 0) ? totalPinsAndGapsWidth : 0;

			if (containerWidth == recentContainerWidth)
			{
				return false;
			}

			recentContainerWidth = containerWidth;
			$container.css('margin', '0 ' + Math.floor((containerWidth - totalPinsAndGapsWidth) / 2) + 'px');

			if (columnsNumber == recentColumnsNumber)
			{
				return false;
			}

			recentColumnsNumber = columnsNumber;

			$pins.each(function(){
				$(this).detach();
			});

			$container.empty();

			var $columns = createColumns(columnsNumber);

			return $columns;
		}

		function createColumns(columnsNumber)
		{
			var $columns = $();
			var i;
			for (i = 0; i < columnsNumber; i++)
			{
				var $column = $('<div>', {'class':'column'});
				$column.css({
					'width': PIN_WIDTH + 'px',
					'margin-bottom': PIN_GAP_HEIGHT,
				});
				if (i == columnsNumber - 1)
				{
					$column.css('margin-right', '0');
				}
				else
				{
					$column.css('margin-right', PIN_GAP_WIDTH);
				}
				$columns = $columns.add($column);
			}

			return $columns;
		}

		function arrangePinsAlongColumns($pins, $columns)
		{
			$columns.each(function(index){
				this._columnHeight = 0;
			});

			var $shortestColumn;

			$pins.each(function(index, pin){
				$shortestColumn = getShortestColumn($columns);
				$shortestColumn.append(pin);
				$shortestColumn.get(0)._columnHeight += (pin._thumbHeight + PIN_HEIGHT_EXCEPT_IMAGE);
			});
		}

		function getShortestColumn($columns)
		{
			var shortestColumnHeight = Infinity;
			var $shortestColumn;
			$columns.each(function(index, column){
				var height = column._columnHeight || 0;
				column._columnHeight = height;
				if (height < shortestColumnHeight)
				{
					shortestColumnHeight = height;
					$shortestColumn = $(column);
				}
			});
			return $shortestColumn;
		}
	};

	$.randomizeHeroImage = function()
	{
		var data;
		var isReady = false;
		var randomized = false;

		$.getJSON('/gallery/data.json', function(galleryData){
			data = galleryData;
			checkBothReady();
		}).fail(function(){
			displayDefaultImage();
		});

		$(document).ready(function(){
			isReady = true;
			checkBothReady();
		});

		function checkBothReady()
		{
			if (data && isReady && !randomized)
			{
				randomized = true;
				randomize();
			}
		}

		function displayDefaultImage()
		{
			var $img = $('#hero_image');
			var $desc = $('#hero_description');

			$img.attr({'src':'/gallery/original/original_03.jpg', 'alt':'Passers-by, Colton Haynes'});
			$img.removeClass('hidden');
			$desc.text('Passersby, Colton Haynes, Oil Bar on Canvas, 30x20cm, 2011');
			return;
		}

		function randomize()
		{
			var images = data.images;

			var $img = $('#hero_image');
			var $desc = $('#hero_description');

			var len = data.images.length;
			if (!len)
			{
				displayDefaultImage();
			}

			var randomIndex = Math.floor(Math.random() * len);
			var image = data.images[randomIndex];

			var src = '/gallery/original/' + image.original;
			var alt = image.title;
			var desc = image.title + ', ' + image.material + ', ' + image.size + ', ' + image.date;

			$img.css({'background-image': 'url(' + src + ')'});
			$img.removeClass('hidden');
			$desc.text(desc);

			$('small.muted').css('display', 'none');
		}
	};
})(jQuery);




