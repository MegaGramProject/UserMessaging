from django.urls import path
from . import views

urlpatterns = [
    path("addUserMessagingFileReaction", views.addUserMessagingFileReaction, name="Add User-Messaging File-Reaction"),
    path("removeUserMessagingFileReaction", views.removeUserMessagingFileReaction, name="Remove User-Messaging File-Reaction"),
    path("getAllMessageFileReactionsForConvo/<str:convoId>", views.getAllMessageFileReactionsForConvo, name='Get All Message-File Reactions for Convo'),
    path("addFileToReplyTo/<str:fileToReplyToId>", views.addFileToReplyTo, name="Add File to Reply To"),
    path("getAllFilesThatWereRepliedToInConvo/<str:convoId>", views.getAllFilesThatWereRepliedToInConvo, name="Get All Replied-to-Files For Convo"),
    path("removeFileThatWasRepliedTo/<str:fileToReplyToId>", views.removeFileThatWasRepliedTo, name="Remove File That Was Replied to")
]