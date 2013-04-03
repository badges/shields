require "shields/command/base"

# list commands and display help
#
class Shields::Command::Help < Shields::Command::Base

  PRIMARY_NAMESPACES = %w( generate )

  # help [COMMAND]
  #
  # list available commands or display help for a specific command
  #
  #Examples:
  #
  # $ shields help
  # Usage: shields COMMAND [command-specific-options]
  #
  # Primary help topics, type "shields help TOPIC" for more details:
  #
  #   generate    #  generate badges
  #   ...
  #
  # $ shields help generate
  # Usage: shields generate [CONFIG]
  #
  #
  def index
    if command = args.shift
      help_for_command(command)
    else
      help_for_root
    end
  end

  alias_command "-h", "help"
  alias_command "--help", "help"

private

  def commands_for_namespace(name)
    Shields::Command.commands.values.select do |command|
      command[:namespace] == name && command[:command] != name
    end
  end

  def namespaces
    namespaces = Shields::Command.namespaces
    namespaces
  end

  def commands
    Shields::Command.commands
  end
  
  def primary_namespaces
    PRIMARY_NAMESPACES.map { |name| namespaces[name] }.compact
  end

  def additional_namespaces
    (namespaces.values - primary_namespaces)
  end

  def summary_for_namespaces(namespaces)
    size = longest(namespaces.map { |n| n[:name] })
    namespaces.sort_by {|namespace| namespace[:name]}.each do |namespace|
      next if skip_namespace?(namespace)
      name = namespace[:name]
      namespace[:description] ||= legacy_help_for_namespace(name)
      puts "  %-#{size}s  # %s" % [ name, namespace[:description] ]
    end
  end

  def help_for_root
    puts "Usage: shields COMMAND [command-specific-options]"
    puts
    puts "Primary help topics, type \"shields help TOPIC\" for more details:"
    puts
    summary_for_namespaces(primary_namespaces)
    puts
    puts "Additional topics:"
    puts
    summary_for_namespaces(additional_namespaces)
    puts
  end

  def help_for_namespace(name)
    namespace_commands = commands_for_namespace(name)

    unless namespace_commands.empty?
      size = longest(namespace_commands.map { |c| c[:banner] })
      namespace_commands.sort_by { |c| c[:banner].to_s }.each do |command|
        next if skip_command?(command)
        command[:summary] ||= legacy_help_for_command(command[:command])
        puts "  %-#{size}s  # %s" % [ command[:banner], command[:summary] ]
      end
    end
  end

  def help_for_command(name)
    if command_alias = Shields::Command.command_aliases[name]
      display("Alias: #{name} redirects to #{command_alias}")
      name = command_alias
    end
    if command = commands[name]
      puts "Usage: shields #{command[:banner]}"

      if command[:help].strip.length > 0
        help = command[:help].split("\n").reject do |line|
          line =~ /HIDDEN/
        end
        puts help[1..-1].join("\n")
      else
        puts
        puts " " + legacy_help_for_command(name).to_s
      end
      puts
    end

    namespace_commands = commands_for_namespace(name)

    if !namespace_commands.empty?
      puts "Additional commands, type \"shields help COMMAND\" for more details:"
      puts
      help_for_namespace(name)
      puts
    elsif command.nil?
      error "#{name} is not a shields command. See `shields help`."
    end
  end
end