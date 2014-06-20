/**
* $ Tooltip Plugin
* @version 0.3
* @author Elizabeth Thompson
*/

//don't check for strict equality. This is needed in this.isIE8 to test for IE8
/* jshint -W041 */

/**
* Description:
* This is a tooltip plugin that displays a message that appears on mouseover and dissappears on mouseout.
*/
var tooltip = {
    /**
    * $ plugin name which can later be used to call the plugin. Href of item that appears needs to be included
    * Example: $("#Elem").actooltip({
        href:"#Mytooltip"
    });
    * @type {String}
    */
    name: "actooltip",

    /**
        * Default options
        * @type {Object}
        */


    options: {
        orientation: "bottom",      // placement of tooltip: bottom, bottomleft, bottomright, bottom center, topleft, topright, topcenter, left, right
        ishover: false,
        collision: true,            // change toolitip position based on collision logic
        container: "#BodyWrapper",  // container to test collision within
        href: "",                   // content to display inside tooltip
        notch: true,                // whether or not to use notch
        notchTag: "<b class='border-notch notch'></b><b class='notch'></b>",    // html for the notch
        speedIn: "fast",             // speed when opening
        speedOut: "500",             // speed when closing
        tooltipHover: true,         
        thisClass: "actooltip",     // class to be added to the tooltip
        action: "hover",            // hover or click to open tooltip
        display: "off",             // (Click only) initially display tooltip?
        closeOnBkgClick: true,      // close tooltip when click on background?
        openFcn: null,              // executes a function after tooltip opens
        closeFcn: null              // executes a function after closes
    },

    //definitions for the name of the tooltip and the trigger, and positioning of the selector/trigger
    setoptions: function () {
        var o = this.options;
        o.thisSelector = o.thisSelector || this.getSelector();
        o.thisTip = o.thisTip || o.href;
        this.tipWidth = $(o.thisTip).width() + parseInt($(o.thisTip).css("paddingLeft"), 10) + parseInt($(o.thisTip).css("paddingRight"), 10);
        this.tipHeight = $(o.thisTip).height() + parseInt($(o.thisTip).css("paddingTop"), 10) + parseInt($(o.thisTip).css("paddingBottom"), 10);

        //assign value of version check to global variable
        this.isIE8 = ($(this.options.thisSelector + ":hover").length == ""); //each of these values will always be false in ie8. Hover length has no value.

        this.addnotch();

    },

    getSelector: function () {
        //this uses a counter to create a unique class to add to the tooltip
        counter.increment();
        this.options.thisClass = this.options.thisClass + counter.value();
        this.$elem.addClass(this.options.thisClass);
        var thisSelector = "." + this.options.thisClass;
        return thisSelector;
    },
    addnotch: function () {
        var str = $(this.options.thisTip).html(),
            o = this.options,
            notch;
        //most browsers will convert ' to ", so replace them in notch string for comparison
        notch = function () {
            while (o.notchTag.indexOf("'") !== -1) {
                o.notchTag = o.notchTag.replace("'", "\"");
            }
            return o.notchTag;
        };
        this.options.notchTag = notch();
        //if notch option is true, and it doesn't already exist
        if (o.notch === true && str.indexOf(o.notchTag) === -1) {
            $(o.thisTip).append(o.notchTag);
        }
        this.setAction.addListeners.call(this);
    },
    //add hover/show event listener
    setAction: {

        showTooltip: function() {
            var o = this.options,
                _self = this;

            if ($(o.thisTip).css("display") === "none" && (this.isIE8 || $(o.thisSelector + ":hover").length > 0 )) { 
                _self.getPosition();
            } else if ($(o.thisTip).css("opacity") > 0 && $(o.thisTip).css("opacity") < 1) {
                window.setTimeout(function () {
                    _self.show();
                }, 200);
            }
        },
        
        hideTooltip: function() {
            var o = this.options,
                _self = this;
            if ($(o.thisTip).css("display") === "block") {
                //the timeout gives the user a chance to leave the selector and mouse over the tooltip
                window.setTimeout(function () {
                    //if the tooltip is not being hovered over and the tooltipHover property has not been set to false, fade out
                    if (this.isIE8 || ($(o.thisTip + ":hover").length === 0  || !o.tooltipHover)) {
                        _self.hide();
                    }
                }, 200);
            }
        },

        hideTooltipCheckHover: function() {
            var o = this.options,
                _self = this;
            window.setTimeout(function () {
                //if the selector is not being hovered over and the tooltip is visible, fade out
                if (_self.isIE8 || ($(o.thisSelector + ":hover").length === 0 && $(o.thisTip).css("opacity") === "1")) { 
                    _self.hide();
                }
            }, 200);
        },

        showTooltipClick: function() {
            if ($(this.options.thisTip).css("display") === "none") { 
                this.getPosition();
            }
        },

        hideTooltipClick: function() {
            var o = this.options;
            console.log("hide");
            if ($(o.thisTip).css("display") === "block") {
                $(o.thisTip).fadeOut(o.speedOut, function () {
                    if(typeof o.closeFcn === "function") { 
                        o.closeFcn(); 
                    }
                    o.display = "off";
                });                
            }
        },

        addListeners: function() {
            var o = this.options,
                _self = this;

            //create hover or click event
            if (o.action === "hover") {
                _self.$elem.hover(function () { //show/hide tooltip on hover
                    _self.setAction.showTooltip.call(_self);
                }, function () {
                    _self.setAction.hideTooltip.call(_self);
                });

                //if the tooltip is moused out... instead of the selector
                if (o.tooltipHover === true) {
                    $(o.thisTip).hover(function () {
                    }, function () {
                        _self.setAction.hideTooltipCheckHover.call(_self);
                    });
                }
            } else if (o.action === "click") {
                _self.$elem.click(function () { //show tooltip on click
                    if( o.display === "off") {
                        _self.setAction.showTooltipClick.call(_self);
                    }
                });
                if (o.closeOnBkgClick) {
                    $("body").click(function (event) {
                        if (o.display === "on") {
                            if ($(o.thisTip).hasClass(event.target.className) || $(event.target).parents().hasClass($(o.thisTip).attr("class"))) {
                                return false;
                            }
                            _self.setAction.hideTooltipClick.call(_self);
                        }
                    });
                }

                window.onresize = function () {
                    // if the tooltip is visible and selector is visible, resize
                    if ( $(o.thisTip).css("display") === "block" && $(o.thisSelector).css("display") !== "none" ) {
                       // watch performance on reposition
                        setTimeout(function() {
                            _self.getPosition(true);
                        }, 200);
                    } else if ($(o.thisTip).css("display") === "block" && $(o.thisSelector).css("display") === "none" ){
                        _self.setAction.hideTooltipClick.call(_self);
                    }
                };
         
            }
        }
    },
    //resets position
    getPosition: function (collision) {
        var o = this.options;
        o.selectorPosition = this.$elem.offset();


        //thisPosition is the final top, left position of where the tooltip should be. If not defined, then reset it to the top left of the selector/trigger.
        o.thisPosition = this.$elem.offset();
        this.setposition(collision);
    },
    //positions the tooltip on the page, relative to the selector/trigger.
    setposition: function (collisionChecked) {
        var o = this.options,
            _self = this,
            orientation,
            tipPadding = function (pad1, pad2) {
                return parseInt($(o.thisTip).css(pad1), 10) + parseInt($(o.thisTip).css(pad2), 10);
            },
            //definitions for common positions relative to the trigger.
            justAbove = function () {
                var topPosition = o.thisPosition.top - $(o.thisTip).height();
                topPosition -= tipPadding("paddingTop", "paddingBottom");
                topPosition -= $(_self.elem).height() + 12;
                o.thisPosition.top = topPosition;
            },
            goLeft = function () {
                o.thisPosition.left += $(_self.elem).width();
                o.thisPosition.left -= $(o.thisTip).width();
            },
            goCenter = function () {
                o.thisPosition.left += ($(_self.elem).width() / 2);
                o.thisPosition.left -= ($(o.thisTip).width() / 2);
            },
            goBottom = function () {
                o.thisPosition.top += $(_self.elem).height();
            };
        if (collisionChecked) {
            orientation = o.neworientation || o.orientation;
        } else {
            orientation = o.orientation;
        }
        //set position based upon given orientation
        switch (orientation) {
            case "bottomleft":
                goBottom();
                goLeft();
                break;
            case "bottomright":
                goBottom();
                break;
            case "bottomcenter":
                goBottom();
                goCenter();
                break;
            case "topleft":
                justAbove();
                goLeft();
                break;
            case "topright":
                justAbove();
                break;
            case "topcenter":
                justAbove();
                goCenter();
                break;
            case "left":
                this.options.thisPosition.left -= $(this.options.thisTip).width();
                this.options.thisPosition.left -= tipPadding("paddingLeft", "paddingRight");
                break;
            case "right":
                this.options.thisPosition.left += this.$elem.width();
                this.options.thisPosition.left += tipPadding("paddingLeft", "paddingRight");
                break;

        }
        //add position criteria to css.
        $(this.options.thisTip).css(this.options.thisPosition);
        //add orientation to class and remove any old ones
        $(this.options.thisTip).removeClass("topcenter topleft topright left right bottomleft bottomcenter bottomright").addClass(orientation);
        
        //if tooltip is already visible, you're done.
        if( $(o.thisTip).css("display") === "block" ){
            return false;
        }
        //if collision has already been checked, show tooltip
        if (collisionChecked === true || this.options.collision === false) {
            this.show();
        } else {
            this.checkCollision();
        }
    },
    checkCollision: function () {
        var _self = this,
            containerWidth = parseInt($(this.options.container).css("width"), 10),
        //definitions for detecting collisions
            collideRight = function () {
                return (_self.options.thisPosition.left + _self.tipWidth > containerWidth);
            },
            collideLeft = function () {
                return (_self.options.thisPosition.left < 0);
            },
            collideTop = function () {
                return (_self.options.thisPosition.top < $(window).scrollTop());
            },
            collideBottom = function () {
                return ((_self.options.thisPosition.top + _self.tipHeight) > (window.innerHeight + $(window).scrollTop()));
            };

        //check to see if there are any collisions, or if collision correction has been disabled, if not, show tooltip.
        if ((!collideLeft() && !collideRight() && !collideTop() && !collideBottom())) {
            this.show();
            //if there are collisions, then reposition the tooltip. Send over where it's currently colliding.
        } else {
            this.reposition(collideRight(), collideLeft(), collideBottom(), collideTop(), containerWidth);
        }
    },
    //take it's current position and where it's colliding and move it to a different position if available.
    reposition: function (right, left, bottom, top, containerWidth) {
        //these tests will return true if there is no collision with the specified edge
        var o = this.options,
            testLeft = (o.selectorPosition.left - this.tipWidth) > 0,
            testRight = (o.selectorPosition.left + this.$elem.width() + this.tipWidth) < containerWidth,
            //top or bottom left.. the left position of these is less left than the testLeft.
            testTBLeft = (o.selectorPosition.left + this.$elem.width() - $(o.thisTip).width()) > 0,
            //top or bottom right.. the right position of these is less right than the testright.
            testTBRight = (o.selectorPosition.left + this.tipWidth) < containerWidth,
            testTop = (o.selectorPosition.top - this.tipHeight) > $(window).scrollTop(),
            testBottom = (o.selectorPosition.top + this.tipHeight) < ($(window).scrollTop() + window.innerHeight),
            neworientation;
        if (right) {
            if (o.orientation === "right") {
                if (testTBRight && testTop) {
                    neworientation = "topright";
                } else if (testLeft) {
                    neworientation = "left";
                } else if (testTop) {
                    neworientation = "topcenter";
                } else {
                    neworientation = "bottomcenter";
                }
            } else if ((neworientation && neworientation === "topright") || o.orientation === "topright") {
                if (testTBLeft) {
                    neworientation = "topleft";
                } else {
                    neworientation = "topcenter";
                }
            } else if ((neworientation && neworientation === "bottomright") || o.orientation === "bottomright") {
                if (testTBLeft) {
                    neworientation = "bottomleft";
                } else {
                    neworientation = "bottomcenter";
                }
            }
        }
        if (left) {
            if ((neworientation && neworientation === "left") || o.orientation === "left") {
                if (testTBLeft && testTop) {
                    neworientation = "topleft";
                } else if (testRight) {
                    neworientation = "right";
                } else if (testTop) {
                    neworientation = "topcenter";
                } else {
                    neworientation = "bottomcenter";
                }
            } else if ((neworientation && neworientation === "topleft") || o.orientation === "topleft") {
                if (testTBRight) {
                    neworientation = "topright";
                } else {
                    neworientation = "topcenter";
                }
            } else if ((neworientation && neworientation === "bottomleft") || o.orientation === "bottomleft") {
                if (testTBRight) {
                    neworientation = "bottomright";
                } else {
                    neworientation = "bottomcenter";
                }
            }
        }
        if (bottom) {
            if ((neworientation && (neworientation === "left" || "bottomleft")) || o.orientation === "left" || "bottomleft") {
                neworientation = "topleft";
            } else if ((neworientation && (neworientation === "right" || "bottomright")) || o.orientation === "right" || "bottomright") {
                neworientation = "topright";
            } else if ((neworientation && neworientation === "bottomcenter") || o.orientation === "bottomcenter") {
                if (testLeft) {
                    neworientation = "left";
                } else if (testRight) {
                    neworientation = "right";
                } else if (testTBLeft) {
                    neworientation = "topleft";
                } else if (testTBRight) {
                    neworientation = "topright";
                } else {
                    neworientation = "topcenter";
                }
            }
        }
        if (top) {
            if ((neworientation && (neworientation === "left" || "topleft")) || o.orientation === "left" || "topleft") {
                if (testBottom) {
                    neworientation = "bottomleft";
                }
            }
            if ((neworientation && (neworientation === "right" || "topright")) || o.orientation === "right" || "topright") {
                if (testBottom) {
                    neworientation = "bottomright";
                }
            }
            if ((neworientation && neworientation === "topcenter") || o.orientation === "topcenter") {
                if (testLeft) {
                    neworientation = "left";
                } else if (testRight) {
                    neworientation = "right";
                } else if (testTBLeft) {
                    neworientation = "bottomleft";
                } else if (testTBRight) {
                    neworientation = "bottomright";
                } else {
                    neworientation = "bottomcenter";
                }

            }
        }
        if (neworientation) {
            this.options.neworientation = neworientation;
        }
        //this will reset all of the positioning and then reapply in the positioning step that follows.
        this.getPosition(true);
    },
    show: function () {
        var _self = this, 
            o = this.options;

        //checking again to see if the mouse is hovered over selector.
        if (this.isIE8 || ($(o.thisSelector + ":hover").length > 0  && $(o.thisTip).css("display") === "none")) { 
            $(o.thisTip).fadeIn(o.speedIn, function () {
                if (o.action === "click") {
                    o.display = "on";
                }
                // execute function after tooltip is opened
                if(typeof o.openFcn === "function") { 
                    o.openFcn(); 
                }
            });
        }
    },
    hide: function () {
        var o = this.options;
        $(o.thisTip).fadeOut(o.speedOut, function () {
            if (typeof o.closeFcn === "function") {
                o.closeFcn();
            }
        });
    },
    init: function (options, elem) {

        // Mix in the passed-in options with the default options
        this.options = $.extend({}, this.options, options);

        // Save reference to the element
        this.elem = elem;
        this.$elem = $(elem);

        this.tipBuilt = false;

        this.setoptions();

        // Return this for chaining / prototyping
        return this;


    }

};
// register tooltip object as a $ plugin
$.plugin(tooltip.name, tooltip);


