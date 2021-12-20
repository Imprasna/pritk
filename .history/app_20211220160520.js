// $(document).ready(function() {

//     // Transition effect for navbar and back-to-top icon
//     $(window).scroll(function() {
//       // checks if window is scrolled more than 500px, adds/removes solid class
//       if($(this).scrollTop() > 550) {
//           $('.navbar').addClass('solid');
//           $('.back-to-top').addClass('visible');
//       } else {
//           $('.navbar').removeClass('solid');
//           $('.back-to-top').removeClass('visible');
//       }

//     });


//     // Scrolling effect for Arrow icons
//     $("#scrollIcon").click(function(e) {
//         e.preventDefault();
//         $.scrollTo($("#about"), 1000);
//     });
//     $("#nav-about").click(function(e) {
//         e.preventDefault();
//         $.scrollTo($("#about"), 1000);
//     });
//     $("#nav-portfolio").click(function(e) {
//         e.preventDefault();
//         $.scrollTo($("#portfolio"), 1000);
//     });
//     $("#nav-contact").click(function(e) {
//         e.preventDefault();
//         $.scrollTo($("#contact"), 1000);
//     });
//     $(".navbar-brand").click(function(e) {
//         e.preventDefault();
//         $.scrollTo(0, 1000);
//     });
      
//   });

// var confettiSettings = { target: 'my-canvas' };
// var confetti = new ConfettiGenerator(confettiSettings);
// confetti.render();
// // You can also pass a canvas element as the target:

// var confettiElement = document.getElementById('my-canvas');
// var confettiSettings = { target: confettiElement };
// var confetti = new ConfettiGenerator(confettiSettings);
// confetti.render();

'use strict';

// If set to true, the user must press
// UP UP DOWN ODWN LEFT RIGHT LEFT RIGHT A B
// to trigger the confetti with a random color theme.
// Otherwise the confetti constantly falls.
var onlyOnKonami = false;

$(function() {
  // Globals
  var $window = $(window)
    , random = Math.random
    , cos = Math.cos
    , sin = Math.sin
    , PI = Math.PI
    , PI2 = PI * 2
    , timer = undefined
    , frame = undefined
    , confetti = [];
  
  var runFor = 2000
  var isRunning = true
  
  setTimeout(() => {
			isRunning = false
	}, runFor);

  // Settings
  var konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]
    , pointer = 0;

  var particles = 150
    , spread = 20
    , sizeMin = 5
    , sizeMax = 12 - sizeMin
    , eccentricity = 10
    , deviation = 100
    , dxThetaMin = -.1
    , dxThetaMax = -dxThetaMin - dxThetaMin
    , dyMin = .13
    , dyMax = .18
    , dThetaMin = .4
    , dThetaMax = .7 - dThetaMin;

  var colorThemes = [
    function() {
      return color(200 * random()|0, 200 * random()|0, 200 * random()|0);
    }, function() {
      var black = 200 * random()|0; return color(200, black, black);
    }, function() {
      var black = 200 * random()|0; return color(black, 200, black);
    }, function() {
      var black = 200 * random()|0; return color(black, black, 200);
    }, function() {
      return color(200, 100, 200 * random()|0);
    }, function() {
      return color(200 * random()|0, 200, 200);
    }, function() {
      var black = 256 * random()|0; return color(black, black, black);
    }, function() {
      return colorThemes[random() < .5 ? 1 : 2]();
    }, function() {
      return colorThemes[random() < .5 ? 3 : 5]();
    }, function() {
      return colorThemes[random() < .5 ? 2 : 4]();
    }
  ];
  function color(r, g, b) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // Cosine interpolation
  function interpolation(a, b, t) {
    return (1-cos(PI*t))/2 * (b-a) + a;
  }

  // Create a 1D Maximal Poisson Disc over [0, 1]
  var radius = 1/eccentricity, radius2 = radius+radius;
  function createPoisson() {
    // domain is the set of points which are still available to pick from
    // D = union{ [d_i, d_i+1] | i is even }
    var domain = [radius, 1-radius], measure = 1-radius2, spline = [0, 1];
    while (measure) {
      var dart = measure * random(), i, l, interval, a, b, c, d;

      // Find where dart lies
      for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
        a = domain[i], b = domain[i+1], interval = b-a;
        if (dart < measure+interval) {
          spline.push(dart += a-measure);
          break;
        }
        measure += interval;
      }
      c = dart-radius, d = dart+radius;

      // Update the domain
      for (i = domain.length-1; i > 0; i -= 2) {
        l = i-1, a = domain[l], b = domain[i];
        // c---d          c---d  Do nothing
        //   c-----d  c-----d    Move interior
        //   c--------------d    Delete interval
        //         c--d          Split interval
        //       a------b
        if (a >= c && a < d)
          if (b > d) domain[l] = d; // Move interior (Left case)
          else domain.splice(l, 2); // Delete interval
        else if (a < c && b > c)
          if (b <= d) domain[i] = c; // Move interior (Right case)
          else domain.splice(i, 0, c, d); // Split interval
      }

      // Re-measure the domain
      for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
        measure += domain[i+1]-domain[i];
    }

    return spline.sort();
  }

  // Create the overarching container
  var container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top      = '0';
  container.style.left     = '0';
  container.style.width    = '100%';
  container.style.height   = '0';
  container.style.overflow = 'visible';
  container.style.zIndex   = '9999';

  // Confetto constructor
  function Confetto(theme) {
    this.frame = 0;
    this.outer = document.createElement('div');
    this.inner = document.createElement('div');
    this.outer.appendChild(this.inner);

    var outerStyle = this.outer.style, innerStyle = this.inner.style;
    outerStyle.position = 'absolute';
    outerStyle.width  = (sizeMin + sizeMax * random()) + 'px';
    outerStyle.height = (sizeMin + sizeMax * random()) + 'px';
    innerStyle.width  = '100%';
    innerStyle.height = '100%';
    innerStyle.backgroundColor = theme();

    outerStyle.perspective = '50px';
    outerStyle.transform = 'rotate(' + (360 * random()) + 'deg)';
    this.axis = 'rotate3D(' +
      cos(360 * random()) + ',' +
      cos(360 * random()) + ',0,';
    this.theta = 360 * random();
    this.dTheta = dThetaMin + dThetaMax * random();
    innerStyle.transform = this.axis + this.theta + 'deg)';

    this.x = $window.width() * random();
    this.y = -deviation;
    this.dx = sin(dxThetaMin + dxThetaMax * random());
    this.dy = dyMin + dyMax * random();
    outerStyle.left = this.x + 'px';
    outerStyle.top  = this.y + 'px';

    // Create the periodic spline
    this.splineX = createPoisson();
    this.splineY = [];
    for (var i = 1, l = this.splineX.length-1; i < l; ++i)
      this.splineY[i] = deviation * random();
    this.splineY[0] = this.splineY[l] = deviation * random();

    this.update = function(height, delta) {
      this.frame += delta;
      this.x += this.dx * delta;
      this.y += this.dy * delta;
      this.theta += this.dTheta * delta;

      // Compute spline and convert to polar
      var phi = this.frame % 7777 / 7777, i = 0, j = 1;
      while (phi >= this.splineX[j]) i = j++;
      var rho = interpolation(
        this.splineY[i],
        this.splineY[j],
        (phi-this.splineX[i]) / (this.splineX[j]-this.splineX[i])
      );
      phi *= PI2;

      outerStyle.left = this.x + rho * cos(phi) + 'px';
      outerStyle.top  = this.y + rho * sin(phi) + 'px';
      innerStyle.transform = this.axis + this.theta + 'deg)';
      return this.y > height+deviation;
    };
  }
     
    
  function poof() {
    if (!frame) {
      // Append the container
      document.body.appendChild(container);

      // Add confetti
      
      var theme = colorThemes[onlyOnKonami ? colorThemes.length * random()|0 : 0]
        , count = 0;
        
      (function addConfetto() {
  
        if (onlyOnKonami && ++count > particles)
          return timer = undefined;
        
        if (isRunning) {
          var confetto = new Confetto(theme);
          confetti.push(confetto);

          container.appendChild(confetto.outer);
          timer = setTimeout(addConfetto, spread * random());
         }
      })(0);
        

      // Start the loop
      var prev = undefined;
      requestAnimationFrame(function loop(timestamp) {
        var delta = prev ? timestamp - prev : 0;
        prev = timestamp;
        var height = $window.height();

        for (var i = confetti.length-1; i >= 0; --i) {
          if (confetti[i].update(height, delta)) {
            container.removeChild(confetti[i].outer);
            confetti.splice(i, 1);
          }
        }

        if (timer || confetti.length)
          return frame = requestAnimationFrame(loop);

        // Cleanup
        document.body.removeChild(container);
        frame = undefined;
      });
    }
  }
    
  $window.keydown(function(event) {
    pointer = konami[pointer] === event.which
      ? pointer+1
      : +(event.which === konami[0]);
    if (pointer === konami.length) {
      pointer = 0;
      poof();
    }
  });
  
  if (!onlyOnKonami) poof();
});



const projects = [
	{
		nr: '001',
		name: 'Random Meal Generator',
		link: 'https://codepen.io/FlorinPop17/full/WNeggor'
	},
	{
		nr: '002',
		name: '2019 Mood Calendar',
		link: 'https://codepen.io/FlorinPop17/full/eYOPdER'
	},
	{
		nr: '003',
		name: 'Double Noise Flow Field',
		link: 'https://codepen.io/FlorinPop17/full/GRKwmgK'
	},
	{
		nr: '004',
		name: 'Catch the insect',
		link: 'https://codepen.io/FlorinPop17/full/NWKELoq'
	},
	{
		nr: '005',
		name: 'User Profile Design',
		link: 'https://codepen.io/FlorinPop17/full/QWLzdrV'
	},
	{
		nr: '006',
		name: 'Pokedex',
		link: 'https://codepen.io/FlorinPop17/full/gOYZxyE'
	},
	{
		nr: '007',
		name: 'James Bond Tribute Page',
		link: 'https://codepen.io/FlorinPop17/full/KKPbjwy'
	},
	{
		nr: '008',
		name: 'Live Twitter Feed',
		link: 'https://codepen.io/FlorinPop17/full/aboXgpP'
	},
	{
		nr: '009',
		name: 'This or That (w/ dogs)',
		link: 'https://codepen.io/FlorinPop17/full/rNBRYKZ'
	},
	{
		nr: '010',
		name: 'Math Wizz Game',
		link: 'https://codepen.io/FlorinPop17/full/RwbOwrm'
	},
	{
		nr: '011',
		name: 'Push Force Game',
		link: 'https://codepen.io/FlorinPop17/full/JjPVBwx'
	},
	{
		nr: '012',
		name: 'Background Pattern Generator',
		link: 'https://codepen.io/FlorinPop17/full/qBWGmqa'
	},
	{
		nr: '013',
		name: 'Password Generator',
		link: 'https://codepen.io/FlorinPop17/full/BaBePej'
	},
	{
		nr: '014',
		name: 'Contact Page Design',
		link: 'https://codepen.io/FlorinPop17/full/ExYBNGy'
	},
	{
		nr: '015',
		name: 'Voting App',
		link: 'https://codepen.io/FlorinPop17/full/NWKQWmq'
	},
	{
		nr: '016',
		name: 'Clock',
		link: 'https://codepen.io/FlorinPop17/full/eYOqQLz'
	},
	{
		nr: '017',
		name: 'Testimonial Design',
		link: 'https://codepen.io/FlorinPop17/full/yLLBPLZ'
	},
	{
		nr: '018',
		name: 'Typing Speed Test',
		link: 'https://codepen.io/FlorinPop17/full/ExxYJdE'
	},
	{
		nr: '019',
		name: 'Send Love Button',
		link: 'https://codepen.io/FlorinPop17/full/eYYYErv'
	},
	{
		nr: '020',
		name: 'Official Website for #100Days100Projects',
		link: 'https://codepen.io/FlorinPop17/full/NWWWYoe'
	},
	{
		nr: '021',
		name: 'Feedback UI Design',
		link: 'https://codepen.io/FlorinPop17/full/eYYmRzb'
	},
	{
		nr: '022',
		name: 'Tricky Cookie',
		link: 'https://codepen.io/FlorinPop17/full/YzzXyoZ'
	},
	{
		nr: '023',
		name: 'Background Animation',
		link: 'https://codepen.io/FlorinPop17/full/jOOPdbE'
	},
	{
		nr: '024',
		name: 'Hover Board',
		link: 'https://codepen.io/FlorinPop17/full/PooPJKL'
	},
	{
		nr: '025',
		name: 'Reviews Design',
		link: 'https://codepen.io/FlorinPop17/full/NWWGoLP'
	},
	{
		nr: '026',
		name: 'Gravity Switch',
		link: 'https://codepen.io/FlorinPop17/full/zYYrEOv'
	},
	{
		nr: '027',
		name: 'Line Through Effect',
		link: 'https://codepen.io/FlorinPop17/full/LYYGMOV'
	},
	{
		nr: '028',
		name: 'Workout Tracker Design',
		link: 'https://codepen.io/FlorinPop17/full/bGGpqrr'
	},
	{
		nr: '029',
		name: 'Event KeyCodes',
		link: 'https://codepen.io/FlorinPop17/full/JjjKjvv'
	},
	{
		nr: '030',
		name: 'Animated Navigation',
		link: 'https://codepen.io/FlorinPop17/full/wvvWxKN'
	},
	{
		nr: '031',
		name: 'New Year Countdown',
		link: 'https://codepen.io/FlorinPop17/full/xxxEqGj'
	},
	{
		nr: '032',
		name: 'Text to Life',
		link: 'https://codepen.io/FlorinPop17/full/eYYdQKz'
	},
	{
		nr: '033',
		name: 'Exchange Rate Calculator',
		link: 'https://codepen.io/FlorinPop17/full/oNNYWxK'
	},
	{
		nr: '034',
		name: 'Billionaires Responsive Table',
		link: 'https://codepen.io/FlorinPop17/full/wvvoxYN'
	},
	{
		nr: '035',
		name: 'Image Reflection',
		link: 'https://codepen.io/FlorinPop17/full//wvvggVN'
	},
	{
		nr: '036',
		name: 'Pricing Design',
		link: 'https://codepen.io/FlorinPop17/full//RwwKXpB'
	},
	{
		nr: '037',
		name: 'Panda Eye Follow',
		link: 'https://codepen.io/FlorinPop17/full/XWWMxNz'
	},
	{
		nr: '038',
		name: '3D Background Boxes',
		link: 'https://codepen.io/FlorinPop17/full/ExxmmKw'
	},
	{
		nr: '039',
		name: 'Blog Post Design',
		link: 'https://codepen.io/FlorinPop17/full/abbWxLN'
	},
	{
		nr: '040',
		name: 'Find It',
		link: 'https://codepen.io/FlorinPop17/full/rNNwGJm'
	},
	{
		nr: '041',
		name: "The 'Different' Chat",
		link: 'https://codepen.io/FlorinPop17/full/rNNwRVp'
	},
	{
		nr: '042',
		name: 'Verify Account UI',
		link: 'https://codepen.io/FlorinPop17/full/poorPYb'
	},
	{
		nr: '043',
		name: 'Rotated Nav Animation',
		link: 'https://codepen.io/FlorinPop17/full/QWWqEqE'
	},
	{
		nr: '044',
		name: 'Particles',
		link: 'https://codepen.io/FlorinPop17/full/wvvrbmY'
	},
	{
		nr: '045',
		name: 'Loading Animation',
		link: 'https://codepen.io/FlorinPop17/full/VwwrByB'
	},
	{
		nr: '046',
		name: 'Image Password Strength',
		link: 'https://codepen.io/FlorinPop17/full/mddqNwd'
	},
	{
		nr: '047',
		name: 'Expanding Cards',
		link: 'https://codepen.io/FlorinPop17/full/QWWarqd'
	},
	{
		nr: '048',
		name: 'Content Placeholder',
		link: 'https://codepen.io/FlorinPop17/full/OJJzddQ'
	},
	{
		nr: '049',
		name: 'Theme Toggler',
		link: 'https://codepen.io/FlorinPop17/full/XWWZYYG'
	},
	{
		nr: '050',
		name: 'Infinite Scroll',
		link: 'https://codepen.io/FlorinPop17/full/zYYWwRy'
	},
	{
		nr: '051',
		name: 'Side Menu Animation',
		link: 'https://codepen.io/FlorinPop17/full/LYYdMXr'
	},
	{
		nr: '052',
		name: 'First YouTube Video',
		link: 'https://codepen.io/FlorinPop17/full/JjjvzJP'
	},
	{
		nr: '053',
		name: 'User Card Design',
		link: 'https://codepen.io/FlorinPop17/full/dyyKpwd'
	},
	{
		nr: '054',
		name: 'Rotation Slideshow',
		link: 'https://codepen.io/FlorinPop17/full/VwwdNvP'
	},
	{
		nr: '055',
		name: 'Message Cards Design',
		link: 'https://codepen.io/FlorinPop17/full/zYYLxOg'
	},
	{
		nr: '056',
		name: 'Digital Block Clock',
		link: 'https://codepen.io/FlorinPop17/full/jOOpQYG'
	},
	{
		nr: '057',
		name: 'Become a Millionaire',
		link: 'https://codepen.io/FlorinPop17/full/qBBMWey'
	},
	{
		nr: '058',
		name: 'Car Avoidance Game',
		link: 'https://codepen.io/FlorinPop17/full/WNNgqqO'
	},
	{
		nr: '059',
		name: 'Direction Aware Hover Effect',
		link: 'https://codepen.io/FlorinPop17/full/WNNaPwa'
	},
	{
		nr: '060',
		name: 'Mobile Tab Navigation',
		link: 'https://codepen.io/FlorinPop17/full/pooQgYO'
	},
	{
		nr: '061',
		name: 'Live User Filter',
		link: 'https://codepen.io/FlorinPop17/full/pooQmjO'
	},
	{
		nr: '062',
		name: 'Blobby',
		link: 'https://codepen.io/FlorinPop17/full/PooXqaQ'
	},
	{
		nr: '063',
		name: 'Blog Posts Design',
		link: 'https://codepen.io/FlorinPop17/full/mddavNq'
	},
	{
		nr: '064',
		name: 'Hidden Search',
		link: 'https://codepen.io/FlorinPop17/full/xxxMJbw'
	},
	{
		nr: '065',
		name: 'Flomoji 🤩',
		link: 'https://codepen.io/FlorinPop17/full/bGGZWjr'
	},
	{
		nr: '066',
		name: 'Moving Hamburger Animation',
		link: 'https://codepen.io/FlorinPop17/full/wvvZvWp'
	},
	{
		nr: '067',
		name: 'Landing Page Header',
		link: 'https://codepen.io/FlorinPop17/full/gOOyaYg'
	},
	{
		nr: '068',
		name: 'Newsletter Design',
		link: 'https://codepen.io/FlorinPop17/full/XWWQLxv'
	},
	{
		nr: '069',
		name: 'Dad Jokes',
		link: 'https://codepen.io/FlorinPop17/full/dyyEvVV'
	},
	{
		nr: '070',
		name: 'Kinetic Loader',
		link: 'https://codepen.io/FlorinPop17/full/yLLWrKB'
	},
	{
		nr: '071',
		name: 'Donate Design',
		link: 'https://codepen.io/FlorinPop17/full/bGGPKZV'
	},
	{
		nr: '072',
		name: 'Instagram Image Feed',
		link: 'https://codepen.io/FlorinPop17/full/zYYgoEZ'
	},
	{
		nr: '073',
		name: 'Form Validation',
		link: 'https://codepen.io/FlorinPop17/full/OJJKQeK'
	},
	{
		nr: '074',
		name: 'Background Changer',
		link: 'https://codepen.io/FlorinPop17/full/MWYgYNM'
	},
	{
		nr: '075',
		name: 'Auto Text',
		link: 'https://codepen.io/FlorinPop17/full/jOENxEL'
	},
	{
		nr: '076',
		name: 'Clip-Path Animation',
		link: 'https://codepen.io/FlorinPop17/full/VwYZNyL'
	},
	{
		nr: '077',
		name: 'Social Links',
		link: 'https://codepen.io/FlorinPop17/full/Powoaoj'
	},
	{
		nr: '078',
		name: 'Color Matching Game',
		link: 'https://codepen.io/FlorinPop17/full/zYxxGzO'
	},
	{
		nr: '079',
		name: 'Background Slider',
		link: 'https://codepen.io/FlorinPop17/full/GRggPob'
	},
	{
		nr: '080',
		name: 'Steps',
		link: 'https://codepen.io/FlorinPop17/full/eYmNQgY'
	},
	{
		nr: '081',
		name: 'Drink Water',
		link: 'https://codepen.io/FlorinPop17/full/ExajrQJ'
	},
	{
		nr: '082',
		name: 'Random Picker Visualizer',
		link: 'https://codepen.io/FlorinPop17/full/zYxvJmP'
	},
	{
		nr: '083',
		name: 'YouTube Video Suggestion UI',
		link: 'https://codepen.io/FlorinPop17/full/mdyeggY'
	},
	{
		nr: '084',
		name: 'Sparkles',
		link: 'https://codepen.io/FlorinPop17/full/xxbZVYm'
	},
	{
		nr: '085',
		name: 'Breadcrumbs Design',
		link: 'https://codepen.io/FlorinPop17/full/eYmZvaB'
	},
	{
		nr: '086',
		name: 'Traffic Lights',
		link: 'https://codepen.io/FlorinPop17/full/ExayYWw'
	},
	{
		nr: '087',
		name: 'Invoice Design',
		link: 'https://codepen.io/FlorinPop17/full/ExaypRr'
	},
	{
		nr: '088',
		name: 'Blurry Loading',
		link: 'https://codepen.io/FlorinPop17/full/mdyEggx'
	},
	{
		nr: '089',
		name: 'Rain Drops',
		link: 'https://codepen.io/FlorinPop17/full/yLyaPJb'
	},
	{
		nr: '090',
		name: 'Tooltip',
		link: 'https://codepen.io/FlorinPop17/full/dyPprax'
	},
	{
		nr: '091',
		name: 'Live Visit Count',
		link: 'https://codepen.io/FlorinPop17/full/BayQZZy'
	},
	{
		nr: '092',
		name: 'CSS Pulse Effect',
		link: 'https://codepen.io/FlorinPop17/full/NWPbJmb'
	},
	{
		nr: '093',
		name: 'Incrementing Counter',
		link: 'https://codepen.io/FlorinPop17/full/BaypGjb'
	},
	{
		nr: '094',
		name: 'Course Card UI',
		link: 'https://codepen.io/FlorinPop17/full/dyPvNKK'
	},
	{
		nr: '095',
		name: '404 Sh*t Page',
		link: 'https://codepen.io/FlorinPop17/full/OJPpQLp'
	},
	{
		nr: '096',
		name: 'Waves',
		link: 'https://codepen.io/FlorinPop17/full/WNbjQWN'
	},
	{
		nr: '097',
		name: 'Hotel Reservation Design',
		link: 'https://codepen.io/FlorinPop17/full/eYmWRdm'
	},
	{
		nr: '098',
		name: 'FAQ',
		link: 'https://codepen.io/FlorinPop17/full/xxbdmYz'
	},
	{
		nr: '099',
		name: 'Cheap, Good, Fast',
		link: 'https://codepen.io/FlorinPop17/full/QWwgyXd'
	}
];

const app = document.getElementById('app');
const imgBaseURL = 'https://www.florin-pop.com/images/100Days100PRojects/Day ';

projects.forEach(project => {
	const title = `${project.name} - #${project.nr}`;
	const imgURL = imgBaseURL + project.nr + '.jpg';
	
	const projectEl = document.createElement('a');
	projectEl.classList.add('project');
	projectEl.href = project.link;
	projectEl.target = '_blank';

	projectEl.innerHTML = `
        <img src="${imgURL}" alt="${title}"/>
		<p>
			${title}
		</p>
    `;

	app.appendChild(projectEl);
});
