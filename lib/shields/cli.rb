load('shields/helpers.rb') # reload helpers after possible inject_loadpath

require "shields"
require "shields/command"
require "shields/helpers"

class Shields::CLI

  extend Shields::Helpers

  def self.start(*args)
    begin
      if $stdin.isatty
        $stdin.sync = true
      end
      if $stdout.isatty
        $stdout.sync = true
      end
      command = args.shift.strip rescue "help"
      Shields::Command.load
      Shields::Command.run(command, args)
    rescue Interrupt
      `stty icanon echo`
      error("Command cancelled.")
    rescue => error
      styled_error(error)
      exit(1)
    end
  end

end