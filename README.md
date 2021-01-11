# z-transform-visualization
visualizing the magnitude response of the z-transform of a system


The z-transform of a difference equation of a system, e.g. an FIR-Filter, is defined by

<img src="https://render.githubusercontent.com/render/math?math=H(z) = \sum_{n=0}^{N}{b_k \cdot z^{-k}}">

which can be rewritten in terms of the system's poles and zeroes:

<img src="https://render.githubusercontent.com/render/math?math=H(z) = b_0 \cdot \frac{\prod_{k=1}^{N}{(z - z_{0,k})} }{\prod_{i=1}^{P}{z - z_{p,i}}} \cdot z^{N-P}">
