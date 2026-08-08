export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "/" });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    },
    pathPrefix: process.env.PATH_PREFIX || "/"
  };
}
