using System.Web.Mvc;

namespace GulpBuildIntegration.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}