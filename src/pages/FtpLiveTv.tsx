import Layout from "@/components/layout/Layout";
import { Tv, Film, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FtpLiveTv = () => {
  return (
    <Layout>
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              FTP & Live TV
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access our FTP movie server and live TV channels exclusively for ANT Bogura customers.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FTP/Movie Server Card */}
            <Card className="hover-lift">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Film className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">FTP / Movie Server</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground text-sm">
                  Browse and download movies, TV shows, and more from our local FTP server.
                </p>
                <Button asChild variant="default" className="w-full">
                  <a
                    href="http://dhakamovie.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <span>Open Movie Server</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Live TV Card */}
            <Card className="hover-lift">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Tv className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Live TV</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground text-sm">
                  Watch live TV channels directly from your browser.
                </p>
                <div className="flex flex-col gap-3">
                  <Button asChild variant="default" className="w-full">
                    <a
                      href="http://172.17.50.112"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <span>Live TV (Local)</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href="http://www.tinyurl.com/antlivetv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <span>Live TV (External)</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FtpLiveTv;
