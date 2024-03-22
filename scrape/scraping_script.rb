require 'open-uri'
require 'nokogiri'
require 'json'
require 'csv'

data = []
headers = []

# Loop through the range of IDs
(58946050..58946444).each_with_index do |id, index|
  url = "https://obd-memorial.ru/html/info.htm?id=#{id}"

  begin
    puts "Scraping page #{index + 1}: #{url}"

    html = URI.open(url)
    doc = Nokogiri::HTML(html)

    # Extract data
    info = {
      "URL" => url
    }
    doc.css('.card_parameter').each do |param|
      title = param.css('.card_param-title').text.strip
      result = param.css('.card_param-result').text.strip
      info[title] = result

      headers << title unless headers.include?(title)
    end

    data << info

    puts "Page #{index + 1} scraped successfully\n\n"
  rescue OpenURI::HTTPError
    # Handle HTTP errors
    puts "Error fetching URL: #{url}"
  end
end

# Write data to CSV file
CSV.open('scraped_data.csv', 'w') do |csv|
  csv << ["URL"] + headers

  data.each do |entry|
    csv << [entry["URL"]] + headers.map { |header| entry[header] }
  end
end

puts "Data has been converted to CSV and saved as 'scraped_data.csv' file."
