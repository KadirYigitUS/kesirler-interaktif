pkgs <- c(
  "ggplot2", "svglite", "ragg", "patchwork", "gridExtra",
  "plotly", "DiagrammeR", "tikzDevice", "rgl", "dplyr", "tidyr", "here"
)

install_if_missing <- function(p) {
  if (!requireNamespace(p, quietly = TRUE)) {
    install.packages(p, repos = "https://cloud.r-project.org")
  }
}

invisible(lapply(pkgs, install_if_missing))

# yükleme
invisible(lapply(pkgs, library, character.only = TRUE))
