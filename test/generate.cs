
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class Program
{
	
	static readonly string[] col1 = new string[] { "D", "b", "A", "a", "C", "c", "d", "ee", "aa", "Aa", "aA" };
	static readonly string[] col2 = new string[] { "1", "2", "3", "4", "5", "10", "11", "12", "1a", "a1", "2b" };
	static readonly string[] col3 = new string[] { "1", "2", "3", "4", "5", "10", "11", "12", "13", "14", "01" };
	static readonly string[] col4 = new string[] { "2", "2", "2", "2", "1", "1", "1", "1", "3", "3", "3" };
	static readonly string[] col5 = new string[] { "5", "6", "4", "5", "2", "3", "1", "1", "2",  "3", "4" };
	static readonly string[] col6 = new string[] { "11", "5", "1", "10",  "4", "2", "3", "6", "7", "8", "9" };
	
	static void Main()
	{
		var jsDomDir = Environment.GetEnvironmentVariable("js_dom_dir");
		
		Console.WriteLine("<!DOCTYPE html>");
		
		using (var writer = new HTMLTagWriter(Console.Out))
		{
			writer.StartTag("html")
				.StartTag("head")
					.StartTag("link").Attribute("rel", "stylesheet").Attribute("href", $"file:///{jsDomDir}/context-control.css").CloseTag()
					.StartTag("link").Attribute("rel", "stylesheet").Attribute("href", $"file:///{jsDomDir}/simple-data-table.css").CloseTag()
					.StartTag("link").Attribute("rel", "stylesheet").Attribute("href", "style.css").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/IEGeneralCompatibility.js").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/IE9Compatibility.js").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/IE8Compatibility.js").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/XMLBuilder.js").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/SimpleEventDispatcher.js").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/ContextControl.js").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/SimpleDataTable.js").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/SimpleDataTableUtils.js").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/SimpleFilterDescriptor.js").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/SimpleSortDescriptor.js").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/SimpleDataTableListener.js").CloseTag()
					.StartTag("script").Attribute("src", $"file:///{jsDomDir}/SimpleDataTableControl.js").CloseTag()
					.StartTag("script").Attribute("src", "script.js").CloseTag()
				.CloseTag()
				.StartTag("body")
					.StartTag("table")
						.StartTag("thead")
							.StartTag("tr")
								.StartTag("th").Content("Column 1").CloseTag()
								.StartTag("th").Content("Column 2").CloseTag()
								.StartTag("th").Content("Column 3").CloseTag()
								.StartTag("th").Content("Column 4").CloseTag()
								.StartTag("th").Content("Column 5").CloseTag()
								.StartTag("th").Content("Column 6").CloseTag()
							.CloseTag()
						.CloseTag()
						.StartTag("tbody");
							for (var i = 0; i < GetMin(col1.Length, col2.Length, col3.Length); ++i)
							{
								writer.StartTag("tr")
									.StartTag("td").Content(i < col1.Length ? col1[i] : "").CloseTag()
									.StartTag("td").Content(i < col2.Length ? col2[i] : "").CloseTag()
									.StartTag("td").Content(i < col3.Length ? col3[i] : "").CloseTag()
									.StartTag("td").Content(i < col4.Length ? col4[i] : "").CloseTag()
									.StartTag("td").Content(i < col5.Length ? col5[i] : "").CloseTag()
									.StartTag("td").Content(i < col6.Length ? col6[i] : "").CloseTag()
								.CloseTag();
							}
						writer.CloseTag()
					.CloseTag()
				.CloseTag()
			.CloseTag();
		}
		
	}
	
	static int GetMin(params int[] args)
	{
		if (args.Length == 0)
		{
			throw new ArgumentException();
		}
		
		var min = args[0];
		for (var i = 1; i < args.Length; ++i)
		{
			if (args[i] < min)
			{
				min = args[i];
			}
		}
		
		return min;
	}
}



public class HTMLTagWriter : IDisposable
{


	static readonly Regex ReservedCharacters = new Regex("[\"&'<>]");
	static readonly IDictionary<string, string> ReservedReplacements = new Dictionary<string, string>
	{
		["\""] = "&quot;",
		["&"] = "&amp;",
		["'"] = "&apos;",
		["<"] = "&lt",
		[">"] = "&gt;"
	};

	static readonly ISet<string> RequiresBodyTags = new HashSet<string> { "script", "button", "select", "div", "span" };


	readonly TextWriter writer;

	bool inAttributes = false;
	readonly Stack<string> tagStack = new Stack<string>();

	public HTMLTagWriter(TextWriter writer)
	{
		this.writer = writer ?? throw new ArgumentNullException("writer");
	}

	public void WriteLine(string value)
	{
		writer.WriteLine(value);
	}

	public void Include(string fname)
	{
		if (inAttributes)
		{
			writer.Write(">");
			inAttributes = false;
		}

		var file = new FileInfo(fname);
		if (!file.Exists)
		{
			throw new ArgumentException($"{fname} does not exist.", "fname");
		}

		var buf = new char[128];
		var content = new StringBuilder();
		using (var stream = file.OpenText())
		{
			int count;
			while ((count = stream.Read(buf, 0, buf.Length)) != 0)
			{
				content.Append(buf, 0, count);
			}
		}

		writer.WriteLine();
		writer.WriteLine(content);
	}

	public HTMLTagWriter WriteDirect(string content)
	{
		if (inAttributes)
		{
			writer.Write(">");
			inAttributes = false;
		}
		writer.WriteLine();
		writer.WriteLine(content);
		return this;
	}

	public HTMLTagWriter StartTag(string name)
	{
		if (inAttributes)
		{
			writer.Write(">");
		}
		inAttributes = true;

		var escapedName = XmlEscape(name);
		tagStack.Push(escapedName);

		writer.Write("<");
		writer.Write(escapedName);

		return this;
	}

	public HTMLTagWriter Attribute(string name, object value = null)
	{
		if (!inAttributes)
		{
			throw new InvalidOperationException();
		}

		writer.Write(" ");
		writer.Write(XmlEscape(name));
		if (value != null)
		{
			writer.Write("=\"");
			writer.Write(XmlEscape(value));
			writer.Write("\"");
		}

		return this;
	}

	public HTMLTagWriter Content(object content)
	{
		if (inAttributes)
		{
			writer.Write(">");
			inAttributes = false;
		}

		writer.Write(XmlEscape(content));
		return this;
	}

	public HTMLTagWriter CloseTag()
	{
		if (tagStack.Count == 0)
		{
			throw new InvalidOperationException();
		}

		var name = tagStack.Pop();
		if (inAttributes)
		{
			if (RequiresBodyTags.Contains(name))
			{
				writer.Write($"></{name}>");
			}
			else
			{
				writer.Write(" />");
			}
		}
		else
		{
			writer.Write($"</{name}>");
		}

		inAttributes = false;
		return this;
	}

	public void Dispose()
	{
		writer.Dispose();
	}

	static string XmlEscape(object o)
	{
		return o == null ? "" : XmlEscape(o.ToString());
	}

	static string XmlEscape(string s)
	{
		var match = ReservedCharacters.Match(s);
		if (!match.Success)
		{
			return s;
		}

		var index = 0;
		var result = new StringBuilder();
		do
		{
			result.Append(s.Substring(index, match.Index - index));
			result.Append(ReservedReplacements[match.Value]);
			index = match.Index + match.Length;
		} while ((match = match.NextMatch()).Success);

		if (index < s.Length)
		{
			result.Append(s.Substring(index));
		}

		return result.ToString();
	}


}
