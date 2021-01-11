# z-transform-visualization
visualizing the magnitude response of the z-transform of a system


The z-transform of a difference equation of a system, e.g. an FIR-Filter, is defined by

<img src="https://render.githubusercontent.com/render/math?math=H(z) = \sum_{n=0}^{N}{b_k \cdot z^{-k}}">

which can be rewritten in terms of the system's poles and zeroes:

<img src="https://render.githubusercontent.com/render/math?math=H(z) = b_0 \cdot \frac{\prod_{k=1}^{N}{(z - z_{0,k})} }{\prod_{i=1}^{P}{(z - z_{p,i})}} \cdot z^{P-N}">

When looking for the magnitude response, one should then look at the z-transform on the unit circle only, i.e. at <img src="https://render.githubusercontent.com/render/math?math=z = e^{j \Omega}"> where <img src="https://render.githubusercontent.com/render/math?math=\Omega = 2 \pi \frac{f}{f_{sample}}"> is the normalized frequency.

<img src="https://render.githubusercontent.com/render/math?math=\mid H(z = e^{j \Omega})\mid = b_0 \cdot \frac{\prod_{k=1}^{N}{(\mid z - z_{0,k}\mid)} }{\prod_{i=1}^{P}{(\mid z - z_{p,i} \mid )}} \cdot \mid z^{P-N}\mid">
