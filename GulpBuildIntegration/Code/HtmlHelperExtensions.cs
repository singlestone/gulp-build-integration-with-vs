using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Microsoft.Ajax.Utilities;

namespace GulpBuildIntegration.Code
{
    public static class HtmlHelperExtensions
    {
        private const string ScriptTemplate = "<script src='{0}' type='text/javascript'></script>";
        private const string LinkTemplate = "<link href='{0}' rel='stylesheet' />";

        #region Public API

        public static MvcHtmlString VersionedTag(this HtmlHelper html, string search, string template)
        {
            return CreateTags(search, template, 1);
        }

        public static MvcHtmlString VersionedTags(this HtmlHelper html, string search, string template, int limit = 0)
        {
            return CreateTags(search, template, limit);
        }

        public static MvcHtmlString VersionedScript(this HtmlHelper html, string search)
        {
            return CreateTags(search, ScriptTemplate);
        }

        public static MvcHtmlString VersionedScripts(this HtmlHelper html, string search, int limit = 0)
        {
            return CreateTags(search, ScriptTemplate, limit);
        }

        public static MvcHtmlString VersionedLink(this HtmlHelper html, string search)
        {
            return CreateTags(search, LinkTemplate);
        }

        public static MvcHtmlString VersionedLinks(this HtmlHelper html, string search, int limit = 0)
        {
            return CreateTags(search, LinkTemplate, limit);
        }

        public static string TestHook(this HtmlHelper html, string value)
        {
            bool enableTestHooks;
            Boolean.TryParse(ConfigurationManager.AppSettings["EnableUserInterfaceTestHooks"], out enableTestHooks);

            if (enableTestHooks && !value.IsNullOrWhiteSpace())
            {
                if (!value.StartsWith("qa-"))
                {
                    value = string.Format("qa-{0}", value);
                }

                return value;
            }

            return string.Empty;
        }

        #endregion

        #region Private Methods

        private static IEnumerable<string> GetFiles(string search, int count = 0)
        {
            var lastSegment = search.LastIndexOf('/');
            var dirName = search.Substring(0, lastSegment);
            var path = VirtualPathUtility.ToAbsolute(dirName);
            var folder = new DirectoryInfo(HttpContext.Current.Server.MapPath(dirName));

            if (!folder.Exists)
            {
                return Enumerable.Empty<string>();
            }

            var fileSearch = search.Substring(lastSegment + 1);

            var results = folder
                .GetFiles(fileSearch)
                .Select(file => path + "/" + file.Name);

            if (count > 0)
            {
                results = results.Take(count);
            }

            return results;
        }

        private static MvcHtmlString CreateTags(string search, string template, int count = 0)
        {
            var tags = GetFiles(search, count).Select(file => String.Format(template, (object)file));
            var retVal = String.Join(Environment.NewLine, tags);

            return MvcHtmlString.Create(retVal);
        }

        #endregion
    }
}