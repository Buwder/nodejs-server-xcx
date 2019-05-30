(function($){
    $.fn.extend({
        mobileNumber : function(setting){
            var ps = $.extend({
                    beginStep : 1,
                    endStep : 10,
                     onPageChange: function(){},
                     moveToPage : function(){
                         
                     },
                     knob : "#knob"
                },setting);
            ps.knob = typeof ps.knob == 'string' ? $(ps.knob) : ps.knob;
            var v = 0;
        ps.knob.knob({
                min:ps.beginStep,
                max:ps.endStep,
                step:1,
                change : function (value) {
                    var fg_color = 250
                    if(value == 0){
                            fg_color = 250;
                     } 
                    fg_color -= 10 * value;
                    this.o.fgColor = "rgb(135, 206, "+fg_color+")";
                    v = value;
                 }, 
                 'release' : function (v) { 
                     ps.onPageChange(v);
                 }
            });
            
            return ps;
        }
  });
})(jQuery);