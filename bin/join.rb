input = ARGV[0]
js_file = input.sub(/\.html/,".merge.js")
jsmin_file = "static/"+input.sub(/\.html/,".min.js")
html_file = input.sub(/\.html/,".min.html")

# Merge
File.open(js_file,"w") do |js| 
	File.open(html_file,"w") do |html| 
		File.open(input, "r") do |src| 
			written = false
			src.each do |line|
				match = line.match(/<script[^>]*src="([^"]*)/)
				if match && match[1].start_with?("src/")
					if !written 
						html.write line.sub(/src="[^"]*"/,"src=\""+jsmin_file+"\"")
					end
					written = true
					js.write File.open(match[1],"rt").read()+"\n"
				else
					html.write line
				end
			end		
		end
	end
end

# Minify
jar_file = File.dirname(__FILE__)+"/compiler.jar"
`java -jar #{jar_file} --js #{js_file} --js_output_file #{jsmin_file}`
