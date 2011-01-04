<%
	Dim http
	Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
	http.Open "GET", "http://api.reittiopas.fi/public-ytv/fi/api/?"&Request.QueryString, False
	http.Send 
	Response.Clear
	Response.Status = http.Status
	Response.ContentType = Http.GetResponseHeader("Content-Type")
	Response.BinaryWrite Http.ResponseBody
	Response.End
%>