#encoding=utf-8
output = File.open("result.log", "w")
File.open("liquidfun.js", "r") {|file|
	file.each_line{|line|
		if line[/(^function b2.+)\(/]
			funNam = $1.split(/ /)[1]
			output.puts "Module[\"#{funNam}\"] = #{funNam};" 
		end
	}
}
output.close