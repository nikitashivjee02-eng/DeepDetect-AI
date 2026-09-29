import os
import threading

import requests

from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.filechooser import FileChooserListView

from plyer import filechooser


# CHANGE THIS TO YOUR COMPUTER'S IP ADDRESS
SERVER_URL = "http://192.168.147.1:5000/predict"


class DetectorApp(App):

    def build(self):

        self.selected_file = None


        layout = BoxLayout(
            orientation="vertical",
            padding=30,
            spacing=20
        )


        title = Label(
            text="AI VIDEO DETECTOR",
            font_size=28,
            size_hint=(1, 0.2)
        )


        self.status = Label(
            text="Select a video",
            font_size=20,
            size_hint=(1, 0.2)
        )


        select_button = Button(
            text="SELECT VIDEO",
            font_size=20,
            size_hint=(1, 0.2)
        )

        select_button.bind(
            on_press=self.select_video
        )


        detect_button = Button(
            text="DETECT VIDEO",
            font_size=20,
            size_hint=(1, 0.2)
        )

        detect_button.bind(
            on_press=self.detect_video
        )


        layout.add_widget(title)

        layout.add_widget(self.status)

        layout.add_widget(select_button)

        layout.add_widget(detect_button)


        return layout


    def select_video(self, instance):

        filechooser.open_file(
            on_selection=self.file_selected
        )


    def file_selected(self, selection):

        if selection:

            self.selected_file = selection[0]

            filename = os.path.basename(
                self.selected_file
            )

            self.status.text = (
                "Selected:\n" + filename
            )


    def detect_video(self, instance):

        if not self.selected_file:

            self.status.text = (
                "Please select a video first."
            )

            return


        self.status.text = (
            "Analyzing video..."
        )


        thread = threading.Thread(
            target=self.send_video
        )

        thread.start()


    def send_video(self):

        try:

            with open(
                self.selected_file,
                "rb"
            ) as video:

                files = {
                    "video": (
                        os.path.basename(
                            self.selected_file
                        ),
                        video,
                        "video/mp4"
                    )
                }


                response = requests.post(
                    SERVER_URL,
                    files=files,
                    timeout=300
                )


            result = response.json()


            if result.get("success"):

                label = result["prediction"]

                confidence = result["confidence"]


                self.status.text = (
                    f"Result: {label}\n"
                    f"Confidence: {confidence}%"
                )

            else:

                self.status.text = (
                    "Error:\n" +
                    result.get(
                        "error",
                        "Unknown error"
                    )
                )


        except Exception as e:

            self.status.text = (
                "Connection error:\n" +
                str(e)
            )


if __name__ == "__main__":

    DetectorApp().run()