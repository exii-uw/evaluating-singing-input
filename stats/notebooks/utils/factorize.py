from matplotlib.font_manager import FontProperties


def wrap_dv(dv):
    pieces = dv.split()
    pieces = [x[0].upper() + x[1:] for x in pieces]
    return r"\textit{" + " ".join(pieces) + r"}"


def wrap_factor(f):
    # return r"\textsc{" + f.lower() + r"}"
    return f.upper()


def factorize_xticks(ax):
    labels = []
    for label in ax.xaxis.get_ticklabels():
        # label.set_text(wrap_factor(label.get_text()))
        # label.set_usetex(True)
        label.set_text(label.get_text().upper())
        labels += [label]
    ax.xaxis.set_ticklabels(labels)
