require 'date'

verbose(false)

# Environment
prefix = File.dirname(__FILE__)
date   = Date.parse(`git log -1`[/^Date:\s+(.+)$/, 1])
commit = `git log -1`[/^commit\s+(.+)$/, 1][0...8]

# Build tools
minifier = "java -jar #{prefix}/bin/compiler.jar"

# Miscellaneous
far_future_header = 
%{<?xml version="1.0" encoding="UTF-8"?>
<configuration>
		<system.webServer>
				<staticContent>
						<clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" />
				</staticContent>
		</system.webServer>
</configuration>
}

# Directories
src      = File.join( prefix, 'src' )
src_api  = File.join( src, 'api' )
src_lib  = File.join( src, 'lib' )
src_css  = File.join( src, "style" )
src_html = File.join( src,"index.html" )
src_js   = FileList[File.join( src,'script','*.js' )]

release           = File.join( prefix, 'release' )
release_static    = File.join( release, commit )
release_css       = File.join( release_static, 'style' )
release_js        = File.join( release_static, 'menoon.min.js' )
release_html      = File.join( release, "index.html" )
release_lib       = File.join( release, 'lib' )
release_api       = File.join( release, 'api' )

# Tasks
task :default => [release] do 
	puts "Finished (#{date} #{commit}) ..."
end
task :clean do
	rm_rf release
end


# File/Directory dependencies
directory release
file release => [release_lib,release_api,release_css,release_js,release_html].flatten do
	puts "Finished building release #{commit}"
end
directory release_lib
file release_lib => src_lib do
	cp_r File.join(src_lib,"."), release_lib
	File.open(File.join(release_lib,"web.config"),'w') do |file|
		file.write far_future_header
	end
	puts "Built #{release_lib}"
end
directory release_api
file release_api => src_api do
	cp_r File.join(src_api,"."), release_api
	puts "Built #{release_api}"
end
directory release_css
file release_css => src_css do
	cp_r File.join(src_css,"."), release_css
	puts "Built #{release_css}"
end
directory release_static
file release_js => [release_static,src_js].flatten do 
	sh "#{minifier} --js #{src_js.join(" --js ")} --js_output_file #{release_js}"
	File.open(File.join(release_static,"web.config"),'w') do |file|
		file.write far_future_header
	end
	puts "Built #{release_js}"
end 

file release_html => src_html do
	script_replaced = false
	File.open(release_html,'w') do |file| 
		File.open(src_html).each do |line| 
			script_match = line.match(/<script[^>]*src="([^"]*)/)
			if script_match && src_js.index{|x|x.relative_to(src)==script_match[1]} then
				unless script_replaced 
					file.write line.sub(script_match[1],release_js.relative_to(release))
					script_replaced = true
				end
			else
				file.write line.sub('href="'+src_css.relative_to(src),'href="'+release_css.relative_to(release))
			end
		end
	end
	puts "Built #{release_html}"
end

class String 
	def relative_to(base)
		self[base.length+1..-1]
	end
end