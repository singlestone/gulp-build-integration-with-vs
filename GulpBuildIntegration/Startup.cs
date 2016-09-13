using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(GulpBuildIntegration.Startup))]
namespace GulpBuildIntegration
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
        }
    }
}
