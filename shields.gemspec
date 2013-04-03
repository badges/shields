# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'shields/version'

Gem::Specification.new do |spec|
  spec.name          = "shields"
  spec.version       = Shields::VERSION
  spec.authors       = ["Olivier Lacan", "Nicholas Acker"]
  spec.email         = ["olivier.lacan@gmail.com", "acker2@me.com"]
  spec.description   = %q{A Shields badge generator to create PNGs from the source SVG template}
  spec.summary       = %q{Easily generate Shields badges for your project}
  spec.homepage      = "http://shields.io"
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_dependency "mini_magick", "~> 3.5.0"
  spec.add_dependency "multi_xml", "~> 0.5.3"

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
  spec.add_development_dependency "rspec", "~> 2.13.0"
  spec.add_development_dependency "fuubar", "~> 1.1.0"
  spec.add_development_dependency "fakefs", "~> 0.4.2"

  spec.post_install_message = <<-MESSAGE
You need imagemagick installed on your system to generate badge PNGs with this gem.
If you have Homebrew installed, simply run:

    brew install imagemagick

Otherwise, install Homebrew, srsly. Please.
  MESSAGE
end
