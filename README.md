# z-transform-visualization
Visualizing the magnitude response of the z-transform of a system with a geometric interpretation.

## CIC / MAV
![gif image](cic.gif)

## Comb
![gif image](comb.gif)

## Lowpass
![gif image](lp.gif)

## Madness
![gif image](mad.gif)

## Explanation
The z-transform of a difference equation of a system, e.g. an FIR-Filter, is defined by

<img src="https://render.githubusercontent.com/render/math?math=H(z) = \sum_{n=0}^{N}{b_k \cdot z^{-k}}">

which can be rewritten in terms of the system's poles and zeroes:

<img src="https://render.githubusercontent.com/render/math?math=H(z) = b_0 \cdot \frac{\prod_{k=1}^{N}{(z - z_{0,k})} }{\prod_{i=1}^{P}{(z - z_{p,i})}} \cdot z^{P-N}">

When looking for the magnitude response, one should then look at the z-transform on the unit circle only, i.e. at <img src="https://render.githubusercontent.com/render/math?math=z = e^{j \Omega}"> where <img src="https://render.githubusercontent.com/render/math?math=\Omega = 2 \pi \frac{f}{f_{sample}}"> is the normalized frequency.

<img src="https://render.githubusercontent.com/render/math?math=\mid H(z = e^{j \Omega})\mid = b_0 \cdot \frac{\prod_{k=1}^{N}{\mid e^{j \Omega} - z_{0,k}\mid} }{\prod_{i=1}^{P}{\mid e^{j \Omega} - z_{p,i} \mid }} \cdot \mid z^{P-N}\mid">

You can see, that the products are simply the products of the distances of a point running on the unit circle to all the poles or zeros (complex numbers) respectively. So for any angle <img src="https://render.githubusercontent.com/render/math?math=\Omega">:

1. Calculate the distances from the point on the unit circle to all 
   * Zeroes --> Numerator
   * Poles  --> Denominator
2. Multiply all the distances, respectively
3. Divide numerator by denominator
4. Plot result at the angle <img src="https://render.githubusercontent.com/render/math?math=\Omega">
5. Profit

The code is kinda terrible and needs a lot of refactoring, but it serves the purpose :)
