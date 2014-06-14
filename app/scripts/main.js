'use strict';

$(document).ready(function() {
	////////////////////////
	// GLOBALS
	////////////////////////

	var header = $('#content > header');
	var navLogo = $('#container > nav.main li.logo');
	var tracker = $('#trackingLine span');
	var trackerTop = -150; //Default position
	var trackerHeight = 50; //Default height
	var navJumping = false; //Are we currently jumping to an area
	var traverseHistory = false;
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

	//Update the window state
	var updateState = function(page) {
		page = (page ? page : '/');
		history.pushState(null, page, page);
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
	var pageState = window.location.pathname;
	if (pageState && pageState !== '/') {
		//Get position of article
		var id = pageState.substring(1);
		var target = $('#'+id).offset().top;
		$('html, body').scrollTop(target);
	}

	////////////////////////
	// PAGE LOAD END
	////////////////////////

	////////////////////////
	// EVENTS
	////////////////////////

	window.onpopstate = function() {
		traverseHistory = true;
		var page = window.location.pathname.substring(1);
		var target = (page ? $('#'+page) : $('#content'));
		target = target.offset().top;
		setTimeout(function() { //I have no idea why this is needed but it is
			$('html, body').scrollTop(target);
		}, 100);
	};

	//Mobile view, nav toggle
	var toggling = false; //a fun word
	$('#menuToggle').click(function(event) {
		event.preventDefault();
		if (toggling) {return;}
		var contentWidth = $('#contentWrap').width();
		if ($('#container > nav.main').hasClass('mobileShown')) {
			//hide
			toggling = true;
			$('#container > nav.main').removeClass('mobileShown');
			$('#contentWrap').removeClass('mobileShown');
			setTimeout(function() {
				$('#contentWrap').attr('style', null);
				toggling = false;
			}, 300);
		}
		else {
			//show
			$('#contentWrap').width(contentWidth);
			$('#container > nav.main').addClass('mobileShown');
			$('#contentWrap').addClass('mobileShown');
		}
	});

	//Hide the nav on nav item click (for mobile view)
	$('body').on('click', '#container > nav.main.mobileShown a', function() {
		//hide
		if (toggling) {return;}
		toggling = true;
		$('#container > nav.main').removeClass('mobileShown');
		$('#contentWrap').removeClass('mobileShown');
		setTimeout(function() {
			$('#contentWrap').attr('style', null);
			toggling = false;
		}, 300);
	});

	//Nav item on hover
	$('#container > nav.main').on('mouseenter focus', 'li a', function() {
		if ($(this).hasClass('pageActive')) {return;}
		toggleCurrentNav($(this), 'on', true);
		tracker.stop(true).animate({
			top: $(this).parent().position().top,
			height: $(this).outerHeight()
		}, animDelay);
	});
	$('#container > nav.main').on('mouseleave blur', 'li a', function() {
		if ($(this).hasClass('pageActive')) {return;}
		toggleCurrentNav($(this), 'off', true);
		updateTrackerPos($(this), true);
	});

	//Nav item on click (well, any link really)
	$('a[href*=#]:not([href=#])').click(function(event) {
		event.preventDefault();
		var ele = $(this);
		var id = ele.attr('href').substring(1);
		if (id === 'content') {id = false;}
		var target = (id ? $('#'+id) : $('#content'));
		var mobileHeaderHeight = ($('#container > nav.mobile').is(':visible') ? $('#container > nav.mobile').height() : 0);
		$('html, body').animate({
			scrollTop: target.offset().top - mobileHeaderHeight,
		}, {
			duration: 300,
			start: function() {
				navJumping = true;
				$('#container > nav.main a').each(function(index, el) {
					if ($(el).attr('href') !== '#' + id) {
						toggleCurrentNav($(el), 'off');
					}
				});
				updateState(id);
				if (!ele.parent().hasClass('logo')) {
					//find the relevant nav icon if we're not clicking on it
					if (!ele.parent().parent().parent().hasClass('main')) {
						ele = $('#container > nav.main a[href=\"#'+id+'\"]');
					}
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
			updateState(false);
		},
		onLeave: function() {
			//show nav logo, hide header logo
			toggleLogo('nav');
		}
	});

	//Page area on scroll to
	$.each($('#content > article'), function(index, val) {
		var navLink = $('#container > nav.main a[href="#'+$(val).attr('id')+'"]');
		var id = $(val).attr('id');
		$(val).scrollspy({
			min: $(val).offset().top - 100,
			max: ($(val).offset().top + $(val).outerHeight(true)) - 100,
			onEnter: function() {
				if (!navJumping) {
					toggleCurrentNav(navLink, 'on');
					updateTrackerPos(navLink);
					if (!traverseHistory) {
						updateState(id);
					}
					traverseHistory = false;
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

	//Contact form validation and submission
	var messageSent = false;
	$('#contact form').validate({
		rules: {
			body: {
				minlength: 5
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

	//Disable side nav horizontal scrolling (while preserving vertical)
	$(window).scroll(function() {
		$('#container > nav.main').css('left', -$(document).scrollLeft());
	});

	//Scrollbar for the sidenav when the window height is short
	$('#container > nav.main').perfectScrollbar({
		wheelSpeed: 20,
		wheelPropagation: false,
		minScrollbarLength: 20,
		includePadding: true
	});
	var trackerContainer = $('#trackingLine');
	$('#container > nav.main').bind('mousewheel', function(event) {
		var scrollbar = $('#container > nav.main .ps-scrollbar-y-rail');
		if (event.originalEvent.wheelDelta /120 > 0) {
			trackerContainer.css('top', scrollbar.css('top'));
		}
		else{
			trackerContainer.css('top', scrollbar.css('top'));
		}
	});
	$(window).resize(function() {
		$('#container > nav.main').perfectScrollbar('update');
	});
	////////////////////////
	// EVENTS END
	////////////////////////
});