'use strict';

$(document).ready(function() {
	////////////////////////
	// GLOBALS
	////////////////////////
	var header = $('#content > header');
	var navLogo = $('#container > nav li.logo');
	var tracker = $('#trackingLine span');
	var trackerTop = -150; //Default position
	var trackerHeight = 50; //Default height
	var navJumping = false; //Are we currently jumping to an area
	var animDelay = 300; //Animation delay period (match to css .3s)

	////////////////////////
	// FUNCTIONS
	////////////////////////

	//Toggle logo image between nav and header
	var toggleLogo = function(type) {
		switch (type) {
			case 'header':
				if (!navLogo.hasClass('hidden')) {
					navLogo.addClass('hidden');
					header.removeClass('hidden');
				}
				break;
			case 'nav':
				if (navLogo.hasClass('hidden')) {
					navLogo.removeClass('hidden');
				}
				if (!header.hasClass('hidden')) {
					header.addClass('hidden');
				}
				break;
		}
	};

	//Move the trackers position, or clears it off screen
	var updateTrackerPos = function(ele, clear, instant) {
		if (clear) {
			trackerTop = -150;
			trackerHeight = 50;
		}
		else {
			trackerTop = ele.parent().position().top;
			trackerHeight = ele.outerHeight();
		}
		var uDelay = (instant ? 0 : animDelay);
		tracker.stop(true).delay(uDelay).animate({
			top: trackerTop,
			height: trackerHeight
		}, uDelay);
	};

	//Toggles the nav item on or off (with class .current)
	var toggleCurrentNav = function(nav, type, hover) {
		var addSecond, removeCurrent;
		switch (type) {
			case 'on':
				if (!nav.hasClass('current')) {
					nav.addClass('current');
					if (!hover) {
						nav.addClass('pageActive');
					}
					addSecond = setTimeout(function() {
						if (!nav.hasClass('current')) {
							nav.removeClass('second');
						}
						else {
							nav.addClass('second');
						}
					}, animDelay);
				}
				else {
					if (!hover) {
						nav.addClass('pageActive');
					}
				}
				break;
			case 'off':
				if (!hover) {
					nav.removeClass('pageActive');
					nav.removeClass('current');
					nav.removeClass('second');
				}
				else {
					if (!nav.hasClass('pageActive')) {
						removeCurrent = setTimeout(function() {
							nav.removeClass('current');
							nav.removeClass('second');
							if (nav.hasClass('pageActive')) {
								nav.addClass('current');
								nav.addClass('second');
							}
						}, animDelay);
					}
				}
				break;
		}
	};

	//Update the window hash
	var updateHash = function(page) {
		window.location.hash = '/' + page;
	};

	////////////////////////
	// FUNCTIONS END
	////////////////////////

	////////////////////////
	// PAGE LOAD
	////////////////////////

	//Show the nav logo depending on page scroll (we wait because browsers suck)
	setTimeout(function() {
		if (!$(header).visible(true)) {
			toggleLogo('nav');
		}
	}, 500);

	//Scroll to the relevant position if given
	var hash = window.location.hash;
	if (hash && hash !== '#/') {
		//Get position of article
		var id = hash.substring(2);
		var target = $('#'+id).offset().top;
		//Set window scroll top to it
		$('html, body').scrollTop(target);
	}

	////////////////////////
	// PAGE LOAD END
	////////////////////////

	////////////////////////
	// EVENTS
	////////////////////////

	//Nav item on hover
	$('#container > nav').on('mouseenter focus', 'li a', function() {
		if ($(this).hasClass('pageActive')) {return;}
		toggleCurrentNav($(this), 'on', true);
		tracker.stop(true).animate({
			top: $(this).parent().position().top,
			height: $(this).outerHeight()
		}, animDelay);
	});
	$('#container > nav').on('mouseleave blur', 'li a', function() {
		if ($(this).hasClass('pageActive')) {return;}
		toggleCurrentNav($(this), 'off', true);
		updateTrackerPos($(this), true);
	});

	//Nav item on click
	$('a[href*=#]:not([href=#])').click(function(event) {
		event.preventDefault();
		var ele = $(this);
		var id = ele.attr('href').substring(1);
		if (id === 'content') {id = false;}
		var target = (id ? $('#'+id) : $('#content'));
		$('html, body').animate({
			scrollTop: target.offset().top,
		}, {
			duration: 300,
			start: function() {
				navJumping = true;
				$('#container > nav a').each(function(index, el) {
					if ($(el).attr('href') !== '#' + id) {
						toggleCurrentNav($(el), 'off');
					}
				});
				updateHash(id);
				if (!ele.parent().hasClass('logo')) {
					toggleCurrentNav(ele, 'on');
				}
			},
			complete: function() {
				navJumping = false;
			}
		});
	});

	//Show/hide header/nav logo on scroll
	$(header).scrollspy({
		min: 0,
		max: header.offset().top + header.outerHeight(),
		onEnter: function() {
			//hide nav logo, show header logo
			toggleLogo('header');
			updateHash('');
		},
		onLeave: function() {
			//show nav logo, hide header logo
			toggleLogo('nav');
		}
	});

	//Page area on scroll to
	$.each($('#content > article'), function(index, val) {
		var navLink = $('#container > nav a[href="#'+$(val).attr('id')+'"]');
		var id = $(val).attr('id');
		$(val).scrollspy({
			min: $(val).offset().top - 100,
			max: ($(val).offset().top + $(val).outerHeight(true)) - 100,
			onEnter: function() {
				if (!navJumping) {
					toggleCurrentNav(navLink, 'on');
					updateTrackerPos(navLink);
					updateHash(id);
					if (index === 0) {
						toggleLogo('nav');
					}
				}
			},
			onLeave: function() {
				if (!navJumping) {
					toggleCurrentNav(navLink, 'off');
					updateTrackerPos(navLink, true, true);
				}
			}
		});
	});

	//Highlight work project areas on scroll
	$.each($('#work > section'), function(index, val) {
		var pictureBorder = $(this).children('.pictures').children('div');
		$(val).scrollspy({
			min: $(val).offset().top - 200,
			max: ($(val).offset().top + $(val).outerHeight(true)) - 200,
			onEnter: function() {
				pictureBorder.attr('class', 'current');
			},
			onLeave: function() {
				pictureBorder.attr('class', '');
			}
		});
	});

	//Lightbox plugin for work images
	$('#work .pictures').each(function() {
		$(this).magnificPopup({
			delegate: 'a',
			type: 'image',
			gallery: {
				enabled: true
			},
			image: {
				titleSrc: function(item) {
					return item.el.attr('title') + ' - ' + item.el.children('img').attr('alt');
				}
			}
		});
	});

	$('#work .role div a').click(function(event) {
		event.preventDefault();
	});

	//Contact form validation and submission
	var messageSent = false;
	$('#contact form').validate({
		rules: {
			body: {
				minlength: 10
			}
		},
		submitHandler: function(form) {
			form = $(form);
			var postData = form.serialize();
			var formURL = form.attr('action');
			if (messageSent) {return;}
			$('#contact .ajaxResponse').remove();
			$('#contact .curtain').hide();
			$.ajax({
				url: formURL,
				type: 'POST',
				data: postData
			})
				.done(function(data) {
					var response = data;
					if ($('#contact .ajaxError').length) {
						$('#contact .ajaxError').slideUp(300).remove();
					}
					form.append('<p class="ajaxResponse">'+response+'</p>');
					$('#contact .curtain').show();
					$('#contact .ajaxResponse').slideDown(300);
					messageSent = true;
				})
				.fail(function() {
					var error = '<strong>Whoops!</strong><br>An error occured on the server, please try again or email me directly at dharvey09@gmail.com';
					if ($('#contact .ajaxError').length) {
						$('#contact .ajaxError').html(error);
					}
					else {
						$('<p class="ajaxError">'+error+'</p>').insertBefore('#contact button');
						$('#contact .ajaxError').slideDown(300);
					}
				});
		},
		errorPlacement: function(error, ele) {
			var top = ele.position().top + ele.outerHeight() + 20;
			error.insertAfter(ele);
			error.css({'top': top});
		}
	});
	$('#contact form input, #contact form textarea').validate({
		onfocusout: true,
		onkeyup: true
	});
	////////////////////////
	// EVENTS END
	////////////////////////
});