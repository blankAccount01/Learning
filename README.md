# About Learning

This is a collection of shaders that I made after sitting down to figure about how shaders work conceptually. This is a follow up to Consistent

# Images

**Floating Illumination:**<br>
It uses a cool Henyey-Greenstein scattering function which works with the fog to show the shadows caused by the "sun" on the object which is a simple arch made of 3 boxes. There's a rotating animation to show the volumetric rays more clearly.
<p align="center"><img width="458" alt="image" src="https://github.com/user-attachments/assets/2396d882-30fd-48ab-a835-461a02ccddc1" /></p>

**Metallic 3D Texture :**<br>
A deformed cube with a fresnel shading, there's two lights, one main light at the front and a soft warm area light at the back. Also some specular highlights. Overall, looks kinda like the iPhone 15 trailer.
<p align="center"><img width="458" alt="image" src="https://github.com/user-attachments/assets/9ea4f2fc-a908-4bc8-989c-3232058ee355" /></p>

**Modulating Cubes :**<br>
I tried experiementing around with audio as an input. This shader takes in an audio input in iChannel0 and then divides it into 9 bands of frequencies. The height of the cubes are then scales based on the volume of each band. There is a warm lighting on the side to illuminate the scene. 
<p align="center"><img width="458" alt="image" src="https://github.com/user-attachments/assets/fc61b4a3-45b9-4fbc-ade3-07d7a3e321a8" /></p>

**Simple Spirograph Tracer :**<br>
This shader traces a spirograph using a formula, which was inspired by the activity of the same name in Swift Playgrounds. To improve performance and speed up the drawing process, I switched to a Buffer A to store the previously drawn section so that the frames were a bit smoother particularly if it was running for a long time.
<p align="center"><img width="458" alt="image" src="https://github.com/user-attachments/assets/f1dbeaa4-9e1a-4eb2-b43f-71d2ea13ec73" /></p>
