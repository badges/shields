require "minitest/autorun"
require 'rake/testtask'
require "rexml/document"
require "mini_magick"
require_relative "../shields_io"

 describe ShieldsIo::SVG do
   before do
     @shield = ShieldsIo::SVG.new(ShieldsIo::SVG::Defaults)
   end

   describe "render" do
     it "must render svg" do
       doc = REXML::Document.new  @shield.render
       doc.root.name.must_equal "svg"
     end
     
     it "must take into account default options" do
       doc = REXML::Document.new  @shield.render
       doc.elements.to_a("//text").first.text.must_equal "vendor"
     end
     
     it "must take into account custom options" do
       doc = REXML::Document.new  ShieldsIo::SVG.new(ShieldsIo::SVG::Defaults.merge(vendor_text: "plop")).render
       doc.elements.to_a("//text").first.text.must_equal "plop"
     end        
   end
   
   describe "render bitmap" do
     it "renders a png" do
       buffer = StringIO.new(@shield.render_bitmap)
       img = MiniMagick::Image.read(buffer,".png")
       img.mime_type.must_equal "image/png"
     end
   end
 end