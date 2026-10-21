// Local-only workaround for "querySrv ECONNREFUSED" with mongodb+srv:// URLs.
// Enable by setting USE_PUBLIC_DNS=true in .env. Not needed on Vercel.
import dns from "dns";

if (process.env.USE_PUBLIC_DNS === "true" && !process.env.VERCEL) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}
