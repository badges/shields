require_relative "shields_io/version"
require "erubis"
require "mini_magick"

module ShieldsIo
  class SVG
    Colors = %w{gray lightgray darkgray green yellowgreen yellow red}
    Defaults =  {height: 18,
        vendor_text:  "vendor",
        vendor_width: 50,
        vendor_color: "gray",
        status_text: "status",
        status_width: 70,
        status_color: "lightgray"
      }

    def initialize(opts={})
      @shield=opts
      @template = File.read("#{File.dirname(__FILE__)}/template.svg.erb")
      raise "unknown vendor color" unless ShieldsIo::SVG::Colors.include? @shield[:vendor_color]
      raise "unknown status color" unless ShieldsIo::SVG::Colors.include? @shield[:status_color]
      raise "height not an integer" unless @shield[:height].is_a? Integer
      raise "vendor width not an integer" unless @shield[:vendor_width].is_a? Integer
      raise "status width not an integer" unless @shield[:status_width].is_a? Integer
    end
    
    def render
      Erubis::Eruby.new(@template).result(@shield)
    end
    
    def render_bitmap(format="png")
      buffer = StringIO.new(self.render)
      img = MiniMagick::Image.read(buffer,".svg")
      img.format format
      img.to_blob
    end
    
  end
end
