module Shields
  module Helpers

    extend self

    def home_directory
      running_on_windows? ? ENV['USERPROFILE'].gsub("\\","/") : ENV['HOME']
    end

    def running_on_windows?
      RUBY_PLATFORM =~ /mswin32|mingw32/
    end

    def running_on_a_mac?
      RUBY_PLATFORM =~ /-darwin\d/
    end

    def display(msg="", new_line=true)
      if new_line
        puts(msg)
      else
        print(msg)
        $stdout.flush
      end
    end

    def redisplay(line, line_break = false)
      display("\r\e[0K#{line}", line_break)
    end

    def deprecate(message)
      display "WARNING: #{message}"
    end

    def confirm(message="Are you sure you wish to continue? (y/n)")
      display("#{message} ", false)
      ['y', 'yes'].include?(ask.downcase)
    end

    def format_date(date)
      date = Time.parse(date).utc if date.is_a?(String)
      date.strftime("%Y-%m-%d %H:%M %Z").gsub('GMT', 'UTC')
    end

    def ask
      $stdin.gets.to_s.strip
    end

    def shell(cmd)
      FileUtils.cd(Dir.pwd) {|d| return `#{cmd}`}
    end

    def run_command(command, args=[])
      Shields::Command.run(command, args)
    end

    def time_ago(since)
      if since.is_a?(String)
        since = Time.parse(since)
      end

      elapsed = Time.now - since

      message = since.strftime("%Y/%m/%d %H:%M:%S")
      if elapsed <= 60
        message << " (~ #{elapsed.floor}s ago)"
      elsif elapsed <= (60 * 60)
        message << " (~ #{(elapsed / 60).floor}m ago)"
      elsif elapsed <= (60 * 60 * 25)
        message << " (~ #{(elapsed / 60 / 60).floor}h ago)"
      end
      message
    end

    def truncate(text, length)
      if text.size > length
        text[0, length - 2] + '..'
      else
        text
      end
    end

    @@kb = 1024
    @@mb = 1024 * @@kb
    @@gb = 1024 * @@mb
    def format_bytes(amount)
      amount = amount.to_i
      return '(empty)' if amount == 0
      return amount if amount < @@kb
      return "#{(amount / @@kb).round}k" if amount < @@mb
      return "#{(amount / @@mb).round}M" if amount < @@gb
      return "#{(amount / @@gb).round}G"
    end

    def quantify(string, num)
      "%d %s" % [ num, num.to_i == 1 ? string : "#{string}s" ]
    end

    def longest(items)
      items.map { |i| i.to_s.length }.sort.last
    end

    def display_table(objects, columns, headers)
      lengths = []
      columns.each_with_index do |column, index|
        header = headers[index]
        lengths << longest([header].concat(objects.map { |o| o[column].to_s }))
      end
      lines = lengths.map {|length| "-" * length}
      lengths[-1] = 0 # remove padding from last column
      display_row headers, lengths
      display_row lines, lengths
      objects.each do |row|
        display_row columns.map { |column| row[column] }, lengths
      end
    end

    def display_row(row, lengths)
      row_data = []
      row.zip(lengths).each do |column, length|
        format = column.is_a?(Fixnum) ? "%#{length}s" : "%-#{length}s"
        row_data << format % column
      end
      display(row_data.join("  "))
    end

    def set_buffer(enable)
      with_tty do
        if enable
          `stty icanon echo`
        else
          `stty -icanon -echo`
        end
      end
    end

    def with_tty(&block)
      return unless $stdin.isatty
      begin
        yield
      rescue
        # fails on windows
      end
    end

    def get_terminal_environment
      { "TERM" => ENV["TERM"], "COLUMNS" => `tput cols`.strip, "LINES" => `tput lines`.strip }
    rescue
      { "TERM" => ENV["TERM"] }
    end

    def fail(message)
      raise Shields::Command::CommandFailed, message
    end

    ## DISPLAY HELPERS

    def action(message, options={})
      display("#{message}... ", false)
      Shields::Helpers.error_with_failure = true
      ret = yield
      Shields::Helpers.error_with_failure = false
      display((options[:success] || "done"), false)
      if @status
        display(", #{@status}", false)
        @status = nil
      end
      display
      ret
    end

    def status(message)
      @status = message
    end

    def format_with_bang(message)
      return '' if message.to_s.strip == ""
      " !    " + message.split("\n").join("\n !    ")
    end

    def output_with_bang(message="", new_line=true)
      return if message.to_s.strip == ""
      display(format_with_bang(message), new_line)
    end

    def error(message)
      if Shields::Helpers.error_with_failure
        display("failed")
        Shields::Helpers.error_with_failure = false
      end
      $stderr.puts(format_with_bang(message))
      exit(1)
    end

    def self.error_with_failure
      @@error_with_failure ||= false
    end

    def self.error_with_failure=(new_error_with_failure)
      @@error_with_failure = new_error_with_failure
    end

    def self.included_into
      @@included_into ||= []
    end

    def self.extended_into
      @@extended_into ||= []
    end

    def self.included(base)
      included_into << base
    end

    def self.extended(base)
      extended_into << base
    end

    def display_header(message="", new_line=true)
      return if message.to_s.strip == ""
      display("=== " + message.to_s.split("\n").join("\n=== "), new_line)
    end

    def display_object(object)
      case object
      when Array
        # list of objects
        object.each do |item|
          display_object(item)
        end
      when Hash
        # if all values are arrays, it is a list with headers
        # otherwise it is a single header with pairs of data
        if object.values.all? {|value| value.is_a?(Array)}
          object.keys.sort_by {|key| key.to_s}.each do |key|
            display_header(key)
            display_object(object[key])
            hputs
          end
        end
      else
        hputs(object.to_s)
      end
    end

    def hputs(string='')
      Kernel.puts(string)
    end

    def hprint(string='')
      Kernel.print(string)
      $stdout.flush
    end

    def spinner(ticks)
      %w(/ - \\ |)[ticks % 4]
    end

    # produces a printf formatter line for an array of items
    # if an individual line item is an array, it will create columns
    # that are lined-up
    #
    # line_formatter(["foo", "barbaz"])                 # => "%-6s"
    # line_formatter(["foo", "barbaz"], ["bar", "qux"]) # => "%-3s   %-6s"
    #
    def line_formatter(array)
      if array.any? {|item| item.is_a?(Array)}
        cols = []
        array.each do |item|
          if item.is_a?(Array)
            item.each_with_index { |val,idx| cols[idx] = [cols[idx]||0, (val || '').length].max }
          end
        end
        cols.map { |col| "%-#{col}s" }.join("  ")
      else
        "%s"
      end
    end

    def styled_array(array, options={})
      fmt = line_formatter(array)
      array = array.sort unless options[:sort] == false
      array.each do |element|
        display((fmt % element).rstrip)
      end
      display
    end

    def format_error(error, message='Shields client internal error.')
      formatted_error = []
      formatted_error << " !    #{message}"
      formatted_error << ' !    Search for help at: https://shields.io'
      formatted_error << ' !    Or report a bug at: https://github.com/olivierlacan/shields/issues/new'
      formatted_error << ''
      formatted_error << "    Error:       #{error.message} (#{error.class})"
      formatted_error << "    Backtrace:   #{error.backtrace.first}"
      error.backtrace[1..-1].each do |line|
        formatted_error << "                 #{line}"
      end
      if error.backtrace.length > 1
        formatted_error << ''
      end
      command = ARGV.map do |arg|
        if arg.include?(' ')
          arg = %{"#{arg}"}
        else
          arg
        end
      end.join(' ')
      formatted_error << "    Command:     shields #{command}"
      formatted_error << "    Version:     #{Shields.user_agent}"
      formatted_error << "\n"
      formatted_error.join("\n")
    end

    def styled_error(error, message='Shields client internal error.')
      if Shields::Helpers.error_with_failure
        display("failed")
        Shields::Helpers.error_with_failure = false
      end
      $stderr.puts(format_error(error, message))
    end

    def styled_header(header)
      display("=== #{header}")
    end

    def styled_hash(hash, keys=nil)
      max_key_length = hash.keys.map {|key| key.to_s.length}.max + 2
      keys ||= hash.keys.sort {|x,y| x.to_s <=> y.to_s}
      keys.each do |key|
        case value = hash[key]
        when Array
          if value.empty?
            next
          else
            elements = value.sort {|x,y| x.to_s <=> y.to_s}
            display("#{key}: ".ljust(max_key_length), false)
            display(elements[0])
            elements[1..-1].each do |element|
              display("#{' ' * max_key_length}#{element}")
            end
            if elements.length > 1
              display
            end
          end
        when nil
          next
        else
          display("#{key}: ".ljust(max_key_length), false)
          display(value)
        end
      end
    end

    def string_distance(first, last)
      distances = [] # 0x0s
      0.upto(first.length) do |index|
        distances << [index] + [0] * last.length
      end
      distances[0] = 0.upto(last.length).to_a
      1.upto(last.length) do |last_index|
        1.upto(first.length) do |first_index|
          first_char = first[first_index - 1, 1]
          last_char = last[last_index - 1, 1]
          if first_char == last_char
            distances[first_index][last_index] = distances[first_index - 1][last_index - 1] # noop
          else
            distances[first_index][last_index] = [
              distances[first_index - 1][last_index],     # deletion
              distances[first_index][last_index - 1],     # insertion
              distances[first_index - 1][last_index - 1]  # substitution
            ].min + 1 # cost
            if first_index > 1 && last_index > 1
              first_previous_char = first[first_index - 2, 1]
              last_previous_char = last[last_index - 2, 1]
              if first_char == last_previous_char && first_previous_char == last_char
                distances[first_index][last_index] = [
                  distances[first_index][last_index],
                  distances[first_index - 2][last_index - 2] + 1 # transposition
                ].min
              end
            end
          end
        end
      end
      distances[first.length][last.length]
    end

    def suggestion(actual, possibilities)
      distances = Hash.new {|hash,key| hash[key] = []}

      possibilities.each do |suggestion|
        distances[string_distance(actual, suggestion)] << suggestion
      end

      minimum_distance = distances.keys.min
      if minimum_distance < 4
        suggestions = distances[minimum_distance].sort
        if suggestions.length == 1
          "Perhaps you meant `#{suggestions.first}`."
        else
          "Perhaps you meant #{suggestions[0...-1].map {|suggestion| "`#{suggestion}`"}.join(', ')} or `#{suggestions.last}`."
        end
      else
        nil
      end
    end

  end
end